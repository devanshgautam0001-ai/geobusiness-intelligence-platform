import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';
import dotenv from 'dotenv';

dotenv.config();
import {
  getCafes,
  saveCafes,
  getUsers,
  addUser,
  updateUser,
  calculateDigitalPresenceScore,
  calculateGrowthOpportunityScore,
  generateRuleBasedRecommendations,
  initializeDatabase
} from './backend/models/db.js';
import { Cafe } from './src/types';

// Initialize in-memory database & storage files
initializeDatabase();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'GEO_BI_PLATFORM_SECRET_KEY_2026';

// Enable json parser with high limit for dataset imports
app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client lazily or with graceful error fallback
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Interfaces for Express requests with User info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'viewer';
  };
}

// Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, userPayload: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    const users = getUsers();
    const fullUser = users.find(u => u.id === userPayload.id);
    if (fullUser) {
      req.user = {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        profilePicture: fullUser.profilePicture,
        lastLogin: fullUser.lastLogin,
        memberSince: fullUser.memberSince
      } as any;
    } else {
      req.user = userPayload;
    }
    next();
  });
}

// Admin only gatekeeper
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges are required for this action.' });
  }
  next();
}

// --- AUTH ENDPOINTS ---

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = getUsers();
  // Find standard seeded or manual user
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Update last login
  const lastLoginStr = new Date().toISOString();
  updateUser(user.id, { lastLogin: lastLoginStr });

  // Sign Token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    profilePicture: user.profilePicture,
    memberSince: user.memberSince,
    lastLogin: lastLoginStr
  };
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  return res.json({
    token,
    user: tokenPayload
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields (Name, Email, Password, Confirm Password) are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  // Choose a random high-fidelity avatar
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face'
  ];
  const profilePicture = avatars[Math.floor(Math.random() * avatars.length)];

  const newUser = {
    id: `usr_${Date.now()}`,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: 'viewer' as const,
    passwordHash: bcrypt.hashSync(password, 10),
    memberSince: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString(),
    profilePicture
  };

  addUser(newUser);

  // Sign Token
  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    profilePicture: newUser.profilePicture,
    memberSince: newUser.memberSince,
    lastLogin: newUser.lastLogin
  };
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

  return res.status(201).json({
    token,
    user: tokenPayload
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, profilePicture } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const updates: any = {};
  if (name !== undefined) updates.name = name.trim();
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;

  const updated = updateUser(req.user.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ success: true, user: updated });
});

app.put('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const users = getUsers();
  const dbUser = users.find(u => u.id === req.user?.id);
  if (!dbUser) {
    return res.status(404).json({ error: 'User session invalid.' });
  }

  if (!bcrypt.compareSync(currentPassword, dbUser.passwordHash)) {
    return res.status(400).json({ error: 'Current password entered is incorrect.' });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  updateUser(dbUser.id, { passwordHash });

  return res.json({ success: true, message: 'Password changed successfully.' });
});


// --- CAFE REST ENDPOINTS ---

// Fetch all cafes with robust search, filter, and sorting
app.get('/api/cafes', authenticateToken, (req: Request, res: Response) => {
  try {
    let list = [...getCafes()];
    const { search, city, category, website, minRating, minOpportunity, sortBy, sortOrder } = req.query;

    // Search query
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }

    // Filters
    if (city) {
      list = list.filter(c => c.city.toLowerCase() === String(city).toLowerCase());
    }

    if (category) {
      list = list.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
    }

    if (website) {
      list = list.filter(c => c.website === String(website));
    }

    if (minRating) {
      const r = parseFloat(String(minRating));
      if (!isNaN(r)) list = list.filter(c => c.rating >= r);
    }

    if (minOpportunity) {
      const opp = parseInt(String(minOpportunity), 10);
      if (!isNaN(opp)) list = list.filter(c => c.growthOpportunityScore >= opp);
    }

    // Sorting
    if (sortBy) {
      const field = String(sortBy) as keyof Cafe;
      const order = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;

      list.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    } else {
      // Default sort: highest Growth Opportunity first
      list.sort((a, b) => b.growthOpportunityScore - a.growthOpportunityScore);
    }

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'An error occurred fetching cafes.' });
  }
});

// Fetch single cafe details
app.get('/api/cafes/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const cafes = getCafes();
  const cafe = cafes.find(c => c.id === id);

  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found.' });
  }

  return res.json(cafe);
});

// Create new cafe (Admin Only)
app.post('/api/cafes', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, rating, reviews, address, area, city, website, phone, latitude, longitude, hours } = req.body;

    if (!name || !category || !address || !area || !city) {
      return res.status(400).json({ error: 'Required fields: name, category, address, area, city' });
    }

    const cafes = getCafes();
    const newId = `cafe_${(cafes.length + 1).toString().padStart(3, '0')}`;

    const rawCafe = {
      website: website || 'N',
      rating: parseFloat(rating) || 0,
      reviews: parseInt(reviews, 10) || 0,
      phone: phone || '',
      hours: hours || ''
    };

    const digitalPresenceScore = calculateDigitalPresenceScore(rawCafe);
    const growthOpportunityScore = calculateGrowthOpportunityScore(rawCafe);
    const recommendationsList = generateRuleBasedRecommendations({
      ...rawCafe,
      growthOpportunityScore
    });
    const recommendation = recommendationsList[0] || "Maintain current digital presence.";

    const newCafe: Cafe = {
      id: newId,
      name,
      category,
      rating: rawCafe.rating,
      reviews: rawCafe.reviews,
      address,
      area,
      city,
      website: rawCafe.website as 'Y' | 'N',
      phone: rawCafe.phone,
      latitude: parseFloat(latitude) || 30.7333,
      longitude: parseFloat(longitude) || 76.7794,
      hours: rawCafe.hours,
      digitalPresenceScore,
      growthOpportunityScore,
      recommendation,
      recommendationsList
    };

    cafes.push(newCafe);
    saveCafes(cafes);

    return res.status(201).json(newCafe);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error creating cafe.' });
  }
});

// Update Cafe (Admin Only)
app.put('/api/cafes/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cafes = getCafes();
    const idx = cafes.findIndex(c => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Cafe not found.' });
    }

    const current = cafes[idx];
    const updates = req.body;

    // Build raw specs
    const rawCafe = {
      website: updates.website !== undefined ? updates.website : current.website,
      rating: updates.rating !== undefined ? parseFloat(updates.rating) : current.rating,
      reviews: updates.reviews !== undefined ? parseInt(updates.reviews, 10) : current.reviews,
      phone: updates.phone !== undefined ? updates.phone : current.phone,
      hours: updates.hours !== undefined ? updates.hours : current.hours
    };

    const digitalPresenceScore = calculateDigitalPresenceScore(rawCafe);
    const growthOpportunityScore = calculateGrowthOpportunityScore(rawCafe);
    const recommendationsList = generateRuleBasedRecommendations({
      ...rawCafe,
      growthOpportunityScore
    });
    const recommendation = recommendationsList[0] || "Maintain current digital presence.";

    const updatedCafe: Cafe = {
      ...current,
      ...updates,
      rating: rawCafe.rating,
      reviews: rawCafe.reviews,
      website: rawCafe.website,
      phone: rawCafe.phone,
      hours: rawCafe.hours,
      digitalPresenceScore,
      growthOpportunityScore,
      recommendation,
      recommendationsList
    };

    cafes[idx] = updatedCafe;
    saveCafes(cafes);

    return res.json(updatedCafe);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error updating cafe.' });
  }
});

// Delete Cafe (Admin Only)
app.delete('/api/cafes/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cafes = getCafes();
    const filtered = cafes.filter(c => c.id !== id);

    if (cafes.length === filtered.length) {
      return res.status(404).json({ error: 'Cafe not found.' });
    }

    saveCafes(filtered);
    return res.json({ success: true, message: 'Cafe successfully deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error deleting cafe.' });
  }
});


// --- BI & ANALYTICS ENDPOINTS ---

app.get('/api/analytics', authenticateToken, (req: Request, res: Response) => {
  try {
    const cafes = getCafes();
    const totalCafes = cafes.length;

    if (totalCafes === 0) {
      return res.json({
        totalCafes: 0,
        averageRating: 0,
        averageReviews: 0,
        websitePercentage: 0,
        noWebsitePercentage: 0,
        topOpportunityCafes: [],
        topRatedCafes: [],
        areaDistribution: [],
        reviewDistribution: []
      });
    }

    const totalRating = cafes.reduce((sum, c) => sum + c.rating, 0);
    const totalReviews = cafes.reduce((sum, c) => sum + c.reviews, 0);
    const cafesWithWebsite = cafes.filter(c => c.website === 'Y').length;

    const averageRating = Number((totalRating / totalCafes).toFixed(2));
    const averageReviews = Math.round(totalReviews / totalCafes);
    const websitePercentage = Number(((cafesWithWebsite / totalCafes) * 100).toFixed(1));
    const noWebsitePercentage = Number((100 - websitePercentage).toFixed(1));

    // Top Opportunity Cafes (higher growthOpportunityScore)
    const topOpportunityCafes = [...cafes]
      .sort((a, b) => b.growthOpportunityScore - a.growthOpportunityScore)
      .slice(0, 8);

    // Top Rated Cafes
    const topRatedCafes = [...cafes]
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 8);

    // Area Distribution (BI stats per Area)
    const areaMap: { [key: string]: Cafe[] } = {};
    cafes.forEach(c => {
      const key = `${c.city} - ${c.area}`;
      if (!areaMap[key]) areaMap[key] = [];
      areaMap[key].push(c);
    });

    const areaDistribution = Object.keys(areaMap).map(areaKey => {
      const areaCafes = areaMap[areaKey];
      const count = areaCafes.length;
      const avgRating = areaCafes.reduce((sum, c) => sum + c.rating, 0) / count;
      const avgReviews = areaCafes.reduce((sum, c) => sum + c.reviews, 0) / count;
      const webCount = areaCafes.filter(c => c.website === 'Y').length;
      const avgPresence = areaCafes.reduce((sum, c) => sum + c.digitalPresenceScore, 0) / count;
      const avgOpp = areaCafes.reduce((sum, c) => sum + c.growthOpportunityScore, 0) / count;

      return {
        area: areaKey,
        cafeCount: count,
        averageRating: Number(avgRating.toFixed(2)),
        averageReviews: Math.round(avgReviews),
        websitePercentage: Number(((webCount / count) * 100).toFixed(1)),
        avgDigitalPresenceScore: Math.round(avgPresence),
        avgGrowthOpportunityScore: Math.round(avgOpp),
      };
    }).sort((a, b) => b.cafeCount - a.cafeCount);

    // Category Distribution
    const categoryMap: { [key: string]: Cafe[] } = {};
    cafes.forEach(c => {
      if (!categoryMap[c.category]) categoryMap[c.category] = [];
      categoryMap[c.category].push(c);
    });

    const categoryDistribution = Object.keys(categoryMap).map(cat => {
      const catCafes = categoryMap[cat];
      const count = catCafes.length;
      const avgRating = catCafes.reduce((sum, c) => sum + c.rating, 0) / count;
      const avgReviews = catCafes.reduce((sum, c) => sum + c.reviews, 0) / count;
      const webCount = catCafes.filter(c => c.website === 'Y').length;

      return {
        category: cat,
        cafeCount: count,
        averageRating: Number(avgRating.toFixed(2)),
        averageReviews: Math.round(avgReviews),
        websitePercentage: Number(((webCount / count) * 100).toFixed(1))
      };
    }).sort((a, b) => b.cafeCount - a.cafeCount);

    // Review counts histogram distribution
    let r0_100 = 0, r100_500 = 0, r500_1000 = 0, r1000_plus = 0;
    cafes.forEach(c => {
      if (c.reviews >= 1000) r1000_plus++;
      else if (c.reviews >= 500) r500_1000++;
      else if (c.reviews >= 100) r100_500++;
      else r0_100++;
    });

    const reviewDistribution = [
      { name: '0 - 100 reviews', value: r0_100 },
      { name: '100 - 500 reviews', value: r100_500 },
      { name: '500 - 1000 reviews', value: r500_1000 },
      { name: '1000+ reviews', value: r1000_plus },
    ];

    return res.json({
      totalCafes,
      averageRating,
      averageReviews,
      websitePercentage,
      noWebsitePercentage,
      topOpportunityCafes,
      topRatedCafes,
      areaDistribution,
      categoryDistribution,
      reviewDistribution
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Analytics calculation failed.' });
  }
});


// --- DYNAMIC AI RECOMMENDATIONS (Gemini API Server-Side) ---

app.post('/api/recommendations/gemini', authenticateToken, async (req: Request, res: Response) => {
  const { cafeId } = req.body;
  if (!cafeId) {
    return res.status(400).json({ error: 'cafeId is required.' });
  }

  const cafes = getCafes();
  const cafe = cafes.find(c => c.id === cafeId);

  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found.' });
  }

  try {
    const ai = getGeminiClient();
    
    // Set up standard instructions to prevent key leaks and guide output format
    const systemPrompt = `You are a high-level Geo-Business Intelligence Consultant and AI Marketing Advisor specializing in restaurant/cafe expansion. 
Analyze the provided cafe data in Chandigarh & Mohali.
Provide a high-quality, actionable, highly professional, localized growth roadmap. 
Format your output in clean Markdown with distinct headers. Avoid self-praise or system coordinates.`;

    const contents = `
Analyze this specific business and provide concrete recommendations:
Business Name: "${cafe.name}"
Category: "${cafe.category}"
Location: "${cafe.address}, ${cafe.area}, ${cafe.city}"
Google Rating: ${cafe.rating} / 5.0
Total Reviews: ${cafe.reviews}
Has Website: "${cafe.website}"
Phone: "${cafe.phone || 'None Listed'}"
Business Hours: "${cafe.hours || 'None Listed'}"

Digital Presence Score calculated: ${cafe.digitalPresenceScore} / 100
Growth Opportunity Score calculated: ${cafe.growthOpportunityScore} / 100

Standard rule suggestions:
${cafe.recommendationsList.map(r => `- ${r}`).join('\n')}

Develop an executive 4-step strategic optimization blueprint for this cafe:
1. Local SEO & Maps Discovery strategy (specifically for the ${cafe.area} market context).
2. Direct Conversion Mechanics (Website, custom ordering, table booking suggestions).
3. Social Media & Viral Instagram engagement concepts targeted at Chandigarh/Mohali youth.
4. Reputation Management (actions to improve ratings/reviews based on current volumes).
Keep it highly concrete, descriptive, and actionable. Avoid generic placeholders.`;

    // Check if the api key is the dummy one or actual
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({ advice: response.text });
    } else {
      // Graceful fallback for demo or missing secrets
      const dummyAdvice = `### 🚀 Executive Growth Blueprint for **${cafe.name}**

*Note: For live-generated dynamic AI advisories, configure your actual **GEMINI_API_KEY** inside Settings > Secrets.*

#### 📍 1. Local Maps & Search SEO Strategy (${cafe.area})
- **Keyword Dominance**: Claim local Google Maps listings by updating descriptors for ${cafe.category} search intent in the ${cafe.area}, ${cafe.city} area.
- **Attributes Cleanup**: Update the missing contact details and hours immediately to stop map drop-offs.

#### 🌐 2. Direct Web Conversion Pipeline
- **Brand Identity**: Since your website presence is currently "${cafe.website === 'Y' ? 'Available' : 'Missing'}", you must ${cafe.website === 'Y' ? 'optimize your speed and call-to-action buttons' : 'launch a single-page localized web ordering hub'}.
- **Menu Syndication**: Connect an online PDF and interactive menu directly on Google Maps and WhatsApp.

#### 📸 3. High-Engagement Instagram Playbook
- **Social Hooks**: Design photogenic mocktails or dessert angles, tagging locations in Sector/Phase landmarks.
- **Micro-Influencers**: Offer free tasting invites to prominent Chandigarh and Mohali food reviewers to gain instant buzz.

#### ⭐ 4. Reputation & Feedback Engine
- **Feedback QR Loops**: Place beautiful physical cards on tables with QR codes linked directly to Google Review creation.
- **Templated Replies**: Instantly respond to positive and negative remarks with genuine, appreciative, and constructive templates.`;

      return res.json({ advice: dummyAdvice });
    }
  } catch (error: any) {
    console.error("Gemini Advisor API error:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI recommendations.' });
  }
});

app.post('/api/ai/chat', authenticateToken, async (req: Request, res: Response) => {
  const { message, cafeId, action } = req.body;

  let cafeContext = "";
  let cafeObj: Cafe | undefined = undefined;
  
  if (cafeId) {
    const cafes = getCafes();
    cafeObj = cafes.find(c => c.id === cafeId);
    if (cafeObj) {
      cafeContext = `
Analyze this business in the Chandigarh & Mohali region:
Business Name: "${cafeObj.name}"
Category: "${cafeObj.category}"
Location: "${cafeObj.address}, ${cafeObj.area}, ${cafeObj.city}"
Google Maps Rating: ${cafeObj.rating} / 5.0
Total Review Count: ${cafeObj.reviews}
Has Website: "${cafeObj.website}"
Phone: "${cafeObj.phone || 'None Listed'}"
Business Hours: "${cafeObj.hours || 'None Listed'}"
Digital Presence Score: ${cafeObj.digitalPresenceScore} / 100
Growth Opportunity Score: ${cafeObj.growthOpportunityScore} / 100
Standard Rule Recommendations: ${cafeObj.recommendationsList.join('; ')}
`;
    }
  }

  // System prompt setup
  const systemPrompt = `You are a world-class Geo-Business Intelligence Consultant, Senior SEO Expert, and Elite Restaurant Marketing Growth Hacker.
Your purpose is to provide highly precise, enterprise-grade, localized business recommendations for food/beverage and cafe merchants in the Chandigarh & Mohali urban centers.
Always respond in clean, well-structured Markdown. Highlight action items with custom formatting. Never leak key details or use technical jargon. Use a highly strategic, consultative, and executive tone.`;

  let prompt = message || "Hello! Provide a regional business market intelligence summary.";
  
  if (action) {
    // Map action card requests to specialized high-value prompts
    const actionPrompts: { [key: string]: string } = {
      growth_plan: `Develop a comprehensive, localized 12-month Growth Plan focusing on the Sector/Phase market context. Define specific offline events, regional partnerships, and loyalty programs to increase ticket size and frequency.`,
      seo_audit: `Provide an in-depth localized Local SEO Audit. Outline exact keyword targeting (e.g. "best cafe in ${cafeObj?.area || 'Chandigarh'}"), Schema markup requirements, local citation building directories, and image geotagging.`,
      gmb_audit: `Run a Google Business Profile (GMB) Optimization Audit. Detail how to improve cover photos, optimize reviews velocity, use secondary categories, utilize GMB updates/posts, and leverage Q&A to boost map visibility.`,
      website_audit: `Generate a Website Optimization Audit and Conversion Rate Optimization (CRO) plan. Detail layout wireframing, menu syndication, online table reservation UX, mobile-speed requirements, and analytics setup.`,
      instagram_strategy: `Formulate a viral Instagram Content & Growth Strategy. Design photogenic beverage presentation guides, localized reels hook lists, tag-and-win sector campaigns, and a list of regional food influencers.`,
      facebook_strategy: `Formulate a Facebook Marketing & Targeted Local Ads Playbook. Outline exact demographic parameters (age 18-35, student/young professional interests), radius geotargeting settings, custom ad copy options, and budget allocation models.`,
      marketing_plan: `Compile a complete Multi-Channel Marketing Plan. Map out budget splits between Social Ads, Local Print/Flyer campaigns, influencer collaborations, and Google Search Ads. Include clear ROI tracking mechanisms.`,
      revenue_prediction: `Perform an AI-Powered Revenue Prediction and Financial Sensitivity Analysis based on the Digital Presence Score (${cafeObj?.digitalPresenceScore || 60}). Estimate potential revenue uplift (e.g. 15-30% increase) by implementing the website and SEO improvements.`,
      competitor_analysis: `Run a high-level Competitor Analysis. Evaluate standard digital scores of similar cafes in the sector, identifying gaps in their offerings and how to exploit them.`,
      nearby_competitors: `Identify Nearby Competitors. Outline a comparative spatial strategy for the ${cafeObj?.area || 'Chandigarh'} area to capture market share from direct and indirect alternatives.`,
      swot_analysis: `Construct a formal SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) based on rating (${cafeObj?.rating || 4.2}), reviews (${cafeObj?.reviews || 200}), and website presence.`,
      digital_transformation: `Structure a step-by-step Digital Transformation Roadmap. Detail point-of-sale (POS) integration, loyalty CRM setup, automated email/WhatsApp newsletter loops, and real-time review widgets.`
    };
    
    if (actionPrompts[action]) {
      prompt = `${actionPrompts[action]}\n\nBusiness Context:${cafeContext || "\nNo specific business selected; analyze Chandigarh-Mohali regional cafe market trends."}`;
    }
  } else if (cafeContext) {
    prompt = `Analyze this business and answer the query: "${prompt}"\n\nBusiness Context:${cafeContext}`;
  }

  try {
    const ai = getGeminiClient();
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({ response: response.text });
    } else {
      // High-quality fallback response for action cards & chat
      const businessName = cafeObj ? cafeObj.name : "Chandigarh Regional Cafe Sector";
      const areaName = cafeObj ? cafeObj.area : "Chandigarh & Mohali Metro Hubs";
      const cityName = cafeObj ? cafeObj.city : "North Region";
      
      let fallbackText = `### 💎 Enterprise AI Business Consultant Report

#### 🏢 Target Business Profile: **${businessName}**
* **Market Coordinates**: ${areaName}, ${cityName}
* **Current Opportunity Rank**: ${cafeObj ? cafeObj.growthOpportunityScore : 'High'} / 100

---

### 🚀 Strategic Analysis Blueprint

Here is your tailored high-impact strategic advisory plan:

1. **Local SEO & Search Dominance**
   - Implement localized keywords targeting like \`best coffee in ${areaName}\` and \`cafes near ${cityName}\`.
   - Update GMB profile with exact location markers, high-resolution 4K imagery, and interactive digital menus.

2. **Digital Conversion Engine**
   - Setup a high-speed, mobile-optimized landing page with direct order integration.
   - Embed a floating WhatsApp Chat widget and integrated Table Booking system.

3. **Viral Social Media System**
   - Launch a custom Instagram campaign with photogenic beverage designs and tag-to-win rewards.
   - Partner with local food reviewers and regional micro-influencers to boost engagement.

4. **Reputation & Review Management**
   - Place custom QR code table cards linked directly to review generation forms.
   - Implement an automated response system to reply to ratings and feedback within 2 hours.

---

*Note: For live-generated dynamic AI advisories, configure your actual **GEMINI_API_KEY** inside Settings > Secrets.*`;

      if (action) {
        const actionTitle = action.toUpperCase().replace('_', ' ');
        fallbackText = `### ⚡ Targeted ${actionTitle} Audit
#### 🏢 Client Profile: **${businessName}** (${areaName})

---

### 📊 Strategic Findings & AI Recommendations

1. **Strategic Intent**
   - Tailored execution plan mapping specifically to the regional context of **${areaName}**, **${cityName}** to maximize local market acquisition.

2. **Execution Framework**
   - **Phase 1 (Days 1-15)**: Implement fundamental digital presence cleanup (updating correct hours, GMB metadata, and phone details).
   - **Phase 2 (Days 16-45)**: Deploy direct conversion pathways (such as landing page, table reservation QR codes, and custom digital menu sync).
   - **Phase 3 (Days 46-90)**: Initiate targeted hyper-local social ads (Instagram/Facebook) and influencer tasting events.

3. **Key Performance Indicators (KPIs)**
   - Target a **25% increase** in maps search impressions and a **15% expansion** in digital/dine-in conversion rates.

---

*To enable real-time dynamic LLM analysis from the Gemini API, please configure a valid **GEMINI_API_KEY**.*`;
      }

      return res.json({ response: fallbackText });
    }
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI chat response.' });
  }
});


// --- CSV/EXCEL DATA EXPORT ---

app.get('/api/reports/csv', authenticateToken, (req: Request, res: Response) => {
  try {
    const cafes = getCafes();
    
    // Define headers
    const headers = [
      'ID',
      'Business Name',
      'Category',
      'Google Rating',
      'Total Reviews',
      'Address',
      'Area',
      'City',
      'Website Available',
      'Phone',
      'Latitude',
      'Longitude',
      'Opening Hours',
      'Digital Presence Score',
      'Growth Opportunity Score',
      'Primary Action'
    ];

    // Escape CSV values
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str}"`;
      }
      return str;
    };

    const rows = cafes.map(c => [
      c.id,
      c.name,
      c.category,
      c.rating,
      c.reviews,
      c.address,
      c.area,
      c.city,
      c.website,
      c.phone,
      c.latitude,
      c.longitude,
      c.hours,
      c.digitalPresenceScore,
      c.growthOpportunityScore,
      c.recommendation
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(escapeCsv).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="geobusiness_intelligence_cafes_dataset.csv"');
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to export CSV.' });
  }
});


// --- SYSTEM ZIP DOWNLOADER ---
// Packaging all development code on the server so the user gets the real workspace immediate zip!

function getFilesRecursively(dir: string, fileList: string[] = [], baseDir: string = ''): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relPath = path.join(baseDir, file);
    const stat = fs.statSync(filePath);

    // Filter exclusions
    if (
      file === 'node_modules' ||
      file === '.git' ||
      file === 'dist' ||
      file === '.cache' ||
      file === 'package-lock.json' ||
      file.endsWith('.zip')
    ) {
      continue;
    }

    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList, relPath);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

app.get('/api/download-zip', (req: Request, res: Response) => {
  return res.status(403).json({
    error: 'Security Policy Violation: Source code package downloads are disabled on the customer dashboard. For developer access, please authenticate via the Developer Console or contact systems administration.'
  });
});


// --- VITE AND STATIC ASSETS HANDLING ---

async function startServer() {
  // Vite dev or static prod serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GeoBusiness Platform] custom full-stack server running at http://localhost:${PORT}`);
  });
}

startServer();
