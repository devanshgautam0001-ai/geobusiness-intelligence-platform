import { useState, useEffect, useMemo } from 'react';
import {
  X, Phone, Clock, Globe, MapPin, Sparkles, TrendingUp, Cpu, Bookmark,
  CheckCircle, AlertCircle, RefreshCw, Layers, Award, ChevronRight,
  Star, Image as ImageIcon, MessageSquare, DollarSign, ArrowUpRight, Compass,
  Laptop, Instagram, BarChart3, AlertTriangle, ShieldCheck, FileText
} from 'lucide-react';
import { Cafe } from '../types';
import { api } from '../utils/api';

interface CafeDetailsProps {
  cafeId: string;
  onClose: () => void;
  onEditClick?: (cafe: Cafe) => void;
  isAdmin: boolean;
  allCafes: Cafe[]; // Passed to compute competitor comparisons & nearby businesses
}

// Custom Markdown parsing component
function CustomMarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-3.5 font-sans text-xs text-white/80 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (trimmed.startsWith('####')) {
          return (
            <h5 key={idx} className="text-xs font-bold text-[#4F8CFF] mt-4 mb-2 flex items-center gap-1.5 font-mono uppercase tracking-widest">
              {trimmed.replace(/^####\s*/, '')}
            </h5>
          );
        }
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-white mt-5 mb-2 font-mono uppercase border-b border-white/[0.06] pb-2 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }

        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-1">
              <span className="text-[#4F8CFF] font-mono mt-0.5"><ChevronRight className="w-3 h-3" /></span>
              <span className="text-white/80">{parseBoldText(content)}</span>
            </div>
          );
        }

        return <p key={idx}>{parseBoldText(trimmed)}</p>;
      })}
    </div>
  );
}

function parseBoldText(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-[#4F8CFF] font-bold font-mono">{part}</strong>;
    }
    return part;
  });
}

export default function CafeDetails({ cafeId, onClose, onEditClick, isAdmin, allCafes }: CafeDetailsProps) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [error, setError] = useState('');

  // Proposal states
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [proposalStep, setProposalStep] = useState(0);
  const [proposalDiagnostics, setProposalDiagnostics] = useState<string[]>([]);

  // Health Score computations
  const healthScore = useMemo(() => {
    if (!cafe) return 0;
    let score = 0;
    // 1. Website (30 pts)
    if (cafe.website === 'Y') score += 30;
    // 2. SEO (40 pts)
    score += Math.round((cafe.digitalPresenceScore / 100) * 40);
    // 3. Reviews Volume (15 pts)
    if (cafe.reviews >= 200) score += 15;
    else if (cafe.reviews >= 80) score += 10;
    else score += 5;
    // 4. Rating level (15 pts)
    if (cafe.rating >= 4.4) score += 15;
    else if (cafe.rating >= 4.0) score += 10;
    else score += 5;
    return Math.min(100, Math.max(0, score));
  }, [cafe]);

  const healthGrade = useMemo(() => {
    if (healthScore >= 85) return 'A+';
    if (healthScore >= 70) return 'A';
    if (healthScore >= 55) return 'B';
    if (healthScore >= 40) return 'C';
    return 'D';
  }, [healthScore]);

  const radarPoints = useMemo(() => {
    if (!cafe) return '';
    const cx = 75;
    const cy = 75;
    const r = 50;
    
    // Five vertices
    const metrics = [
      cafe.digitalPresenceScore / 100, // SEO
      cafe.website === 'Y' ? 1.0 : 0.2, // Web
      cafe.reviews >= 150 ? 1.0 : cafe.reviews >= 50 ? 0.7 : 0.4, // GMB Optimization
      cafe.rating >= 4.4 ? 1.0 : cafe.rating >= 4.0 ? 0.8 : 0.5, // Rating
      Math.min(1.0, cafe.reviews / 300) // Review Velocity
    ];
    
    const points = metrics.map((val, i) => {
      const angle = i * (2 * Math.PI / 5);
      const x = cx + r * val * Math.sin(angle);
      const y = cy - r * val * Math.cos(angle);
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }, [cafe]);

  const fetchCafeDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCafeById(cafeId);
      setCafe(data);
      setAiAdvice(''); // Reset advice on cafe transition
    } catch (err: any) {
      setError(err.message || 'Failed to load cafe details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cafeId) {
      fetchCafeDetails();
    }
  }, [cafeId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (advisorLoading) {
      setDiagnosticStep(0);
      interval = setInterval(() => {
        setDiagnosticStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 600);
    }
    return () => clearInterval(interval);
  }, [advisorLoading]);

  const triggerAiAdvisor = async () => {
    if (!cafe) return;
    setAdvisorLoading(true);
    setAiAdvice('');
    try {
      const response = await api.getGeminiAdvice(cafe.id);
      setAiAdvice(response.advice);
    } catch (err: any) {
      setAiAdvice(`### ❌ Connection Interrupted\nFailed to invoke Gemini API: ${err.message || 'Unknown server fault'}. Check your secrets configuration.`);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const triggerProposal = () => {
    if (!cafe) return;
    setProposalLoading(true);
    setProposal(null);
    setProposalStep(0);
    setProposalDiagnostics([
      "Establishing pipeline context for " + cafe.name + "...",
      "Simulating competitive spatial vacancy index in " + cafe.area + "...",
      "Modeling estimated conversion rate optimization (CRO) lift...",
      "Drafting client strategic contract agreements & roadmaps..."
    ]);

    const interval = setInterval(() => {
      setProposalStep(prev => {
        if (prev < 3) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setProposalLoading(false);
          setProposal({
            id: `proposal_${cafe.id}_${Date.now()}`,
            clientName: cafe.name,
            location: `${cafe.area}, ${cafe.city}`,
            date: new Date().toLocaleDateString(),
            grade: healthGrade,
            score: healthScore,
            revenueLift: revenueMetrics.lift,
            revenueCap: revenueMetrics.cap,
            modules: [
              { name: "Responsive Enterprise Website Core & Schema Setup", cost: "₹75,000", desc: "Production ready Next.js + Tailwind web portal optimized for local SEO speed index. Fully responsive index cards, online reservation widget and micro-data schema markups." },
              { name: "Google My Business & Maps SEO Overhaul Pack", cost: "₹35,000", desc: "Optimize local citation volume, standard keywords inclusion, schema maps ranking, local guide velocity boost, review automation funnels." },
              { name: "Instagram Local-Boost Engagement Integration", cost: "₹45,000", desc: "Design localized micro-influencer referral funnels, customized beverage reveal hook templates and link-in-bio reservation checkout links." }
            ],
            totalCost: "₹1,55,000",
            timeline: [
              { week: "Week 1", title: "Domain acquisition, SEO keywords, schema setup", details: "Acquire domain, configure GSC, deploy local business JSON-LD schemas." },
              { week: "Week 2", title: "Core Web UI Design & Menu CMS coding", details: "Develop visual custom branding, deploy responsive menu system." },
              { week: "Week 3", title: "Reservation engine & checkout integration", details: "Connect reservation APIs, setup automated WhatsApp/SMS hooks." },
              { week: "Week 4", title: "GMB speed boost & social media handoff", details: "Deploy review automation campaigns and Instagram local referral maps." }
            ],
            roiPercentage: "420% ROI over 12 Months"
          });
          return prev;
        }
      });
    }, 800);
  };

  // Nearby Cafes computation
  const nearbyCafes = useMemo(() => {
    if (!cafe || !allCafes) return [];
    return allCafes
      .filter(c => c.id !== cafe.id && c.area === cafe.area)
      .slice(0, 2);
  }, [cafe, allCafes]);

  // Competitor Comparison calculations
  const topCompetitor = useMemo(() => {
    if (!cafe || !allCafes) return null;
    return allCafes
      .filter(c => c.id !== cafe.id && c.area === cafe.area)
      .sort((a, b) => b.digitalPresenceScore - a.digitalPresenceScore)[0] || null;
  }, [cafe, allCafes]);

  // Estimated Revenue Lift Calculation
  const revenueMetrics = useMemo(() => {
    if (!cafe) return { lift: 'INR 0', cap: 'INR 0' };
    const missingWebsite = cafe.website !== 'Y';
    let multiplier = 0.15; // standard base lift (15%)
    if (missingWebsite) multiplier += 0.20; // 20% additional lift if they create a website
    if (cafe.digitalPresenceScore < 50) multiplier += 0.15; // more optimization scope

    const estimatedMonthlySales = cafe.reviews * 1400; // estimated volume multiplier
    const potentialLift = estimatedMonthlySales * multiplier;
    
    return {
      lift: `₹${Math.round(potentialLift).toLocaleString()}`,
      cap: `₹${Math.round(potentialLift * 12).toLocaleString()}`
    };
  }, [cafe]);

  if (loading) {
    return (
      <div className="glass-panel border-l border-white/[0.06] w-full lg:w-[480px] h-full p-6 flex flex-col justify-center items-center gap-4 relative z-20">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-[#4F8CFF] border-r-2 border-transparent animate-spin" />
          <Cpu className="w-5 h-5 text-[#7C5CFF] absolute animate-pulse" />
        </div>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold animate-pulse">Retrieving Business Node Data...</p>
      </div>
    );
  }

  if (error || !cafe) {
    return (
      <div className="glass-panel border-l border-white/[0.06] w-full lg:w-[480px] h-full p-6 flex flex-col justify-center items-center text-center relative z-20">
        <AlertCircle className="w-10 h-10 text-[#EF4444] mb-3 animate-bounce" />
        <h4 className="font-serif italic text-lg text-white">Registry Sync Failure</h4>
        <p className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-widest">{error || 'Business record omitted'}</p>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-[10px] font-mono text-white rounded-xl uppercase tracking-wider transition-all duration-300">
          Dismiss Panel
        </button>
      </div>
    );
  }

  const diagnostics = [
    "Establishing secure pipe to Gemini 3.5 LLM server...",
    "Injecting business parameters and regional sector metrics...",
    "Analysing competitors in Chandigarh & Mohali coordinates...",
    "Compiling targeted digital expansion recommendations...",
    "Structuring enterprise executive roadmap...",
  ];

  return (
    <div className="glass-panel border-l border-white/[0.06] w-full lg:w-[480px] h-full flex flex-col shadow-2xl relative z-20 animate-slideLeft">
      
      {/* 1. STICKY ACTION HEADER */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#0E1117]/85 backdrop-blur-md sticky top-0 z-10">
        <div>
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#4F8CFF] bg-[#4F8CFF]/10 px-2.5 py-1 rounded-full border border-[#4F8CFF]/20">
            Enterprise Client Node
          </span>
          <h3 className="font-serif italic text-xl text-white mt-2 max-w-[280px] truncate leading-tight">{cafe.name}</h3>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && onEditClick && (
            <button
              onClick={() => onEditClick(cafe)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all duration-300 active:scale-95"
            >
              Modify
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.04] text-white/40 hover:text-white rounded-xl cursor-pointer transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE SPECIFICATIONS PANEL */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* HERO BANNER & MOCK IMAGE GALLERY */}
        <div className="relative h-48 rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl group flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          
          {/* Aesthetic coffee illustration placeholder */}
          <div className="absolute inset-0 flex items-center justify-center text-white/[0.02] font-serif text-8xl font-bold tracking-widest uppercase select-none pointer-events-none">
            Espresso
          </div>

          <div className="absolute top-3 right-3 z-20 bg-black/60 border border-white/[0.08] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-mono text-white/70">
            <ImageIcon className="w-3.5 h-3.5 text-[#4F8CFF]" />
            <span>4 Visual Assets</span>
          </div>

          <div className="p-4 relative z-20 w-full flex justify-between items-end">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-widest text-white/40 font-bold">REGIONAL SECTOR</p>
              <p className="text-xs font-mono font-semibold text-[#32D583] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {cafe.area}, {cafe.city}
              </p>
            </div>
            <div className="flex gap-1.5">
              <span className="w-6 h-6 rounded bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer" />
              <span className="w-6 h-6 rounded bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer" />
              <span className="w-6 h-6 rounded bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer" />
            </div>
          </div>
        </div>

        {/* BUSINESS HEALTH ENGINE */}
        <div className="bg-[#141922]/40 border border-white/[0.06] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-2.5">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#32D583]" />
              AI Business Health Score
            </span>
            <span className="text-[8px] font-mono text-[#32D583] bg-[#32D583]/10 px-2 py-0.5 rounded border border-[#32D583]/20 font-bold">
              Grade {healthGrade} • {healthScore < 55 ? 'Critical Intervention' : healthScore < 75 ? 'Strategic Growth' : 'Optimized Node'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Circular Radial Meter */}
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/[0.03] relative">
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Glow Filter */}
                <defs>
                  <filter id="healthGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Background track */}
                <circle cx="56" cy="56" r="38" stroke="rgba(255,255,255,0.04)" strokeWidth="6.5" fill="transparent" />
                {/* Active track */}
                <circle
                  cx="56"
                  cy="56"
                  r="38"
                  stroke={healthScore < 55 ? '#EF4444' : healthScore < 75 ? '#F59E0B' : '#32D583'}
                  strokeWidth="6.5"
                  strokeDasharray="239"
                  strokeDashoffset={239 - (239 * healthScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#healthGlow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text inside circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-space font-extrabold text-white">{healthScore}</span>
                <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">Index Rating</span>
              </div>
            </div>

            {/* SVG Polygon Radar Chart */}
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/[0.03]">
              <svg className="w-28 h-28" viewBox="0 0 150 150">
                {/* Outer grid pentagon */}
                <polygon points="75,25 122.5,59.5 104.3,115.5 45.7,115.5 27.5,59.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <polygon points="75,45 108.5,69.5 95.8,103.5 54.2,103.5 41.5,69.5" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <polygon points="75,60 95.1,74.5 87.2,100 62.8,100 54.9,74.5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                
                {/* Spokes */}
                <line x1="75" y1="75" x2="75" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="75" y1="75" x2="122.5" y2="59.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="75" y1="75" x2="104.3" y2="115.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="75" y1="75" x2="45.7" y2="115.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="75" y1="75" x2="27.5" y2="59.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Filled Radar area */}
                <polygon
                  points={radarPoints}
                  fill="rgba(79,140,255,0.15)"
                  stroke="#4F8CFF"
                  strokeWidth="1.5"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Corner Labels */}
                <text x="75" y="18" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">SEO</text>
                <text x="133" y="62" textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">WEB</text>
                <text x="112" y="125" textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">GMB</text>
                <text x="38" y="125" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">RATING</text>
                <text x="17" y="62" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">VEL</text>
              </svg>
            </div>
          </div>

          {/* Itemized Score Metrics List */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.04] text-[9px] font-mono">
            <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
              <span className="text-white/40">Website Status:</span>
              <span className={cafe.website === 'Y' ? 'text-[#32D583] font-bold' : 'text-[#EF4444]'}>{cafe.website === 'Y' ? '30/30' : '0/30'}</span>
            </div>
            <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
              <span className="text-white/40">SEO Checklist:</span>
              <span className="text-[#32D583] font-bold">{Math.round((cafe.digitalPresenceScore / 100) * 40)}/40</span>
            </div>
            <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
              <span className="text-white/40">GMB Review Vol:</span>
              <span className="text-[#32D583] font-bold">{cafe.reviews >= 200 ? '15' : cafe.reviews >= 80 ? '10' : '5'}/15</span>
            </div>
            <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
              <span className="text-white/40">Rating Level:</span>
              <span className="text-[#32D583] font-bold">{cafe.rating >= 4.4 ? '15' : cafe.rating >= 4.0 ? '10' : '5'}/15</span>
            </div>
          </div>
        </div>

        {/* ENTERPRISE PROPOSAL GENERATOR CARD */}
        <div className="bg-gradient-to-br from-[#10141D] to-[#141922] border border-white/[0.06] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-white">
            <DollarSign className="w-14 h-14" />
          </div>
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-2.5">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#32D583]" />
              Strategic Revenue Impact
            </span>
            <span className="text-[8px] font-mono text-[#32D583] bg-[#32D583]/10 px-2 py-0.5 rounded border border-[#32D583]/20 font-bold">
              ROI Forecast model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3.5">
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase block">Monthly Lift Potential</span>
              <span className="text-lg font-space font-extrabold text-white block mt-0.5">{revenueMetrics.lift}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase block">Annual Sales Gap</span>
              <span className="text-lg font-space font-extrabold text-[#32D583] block mt-0.5">{revenueMetrics.cap}</span>
            </div>
          </div>

          <button
            onClick={triggerProposal}
            disabled={proposalLoading}
            className="w-full mt-5 py-3 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] hover:opacity-95 text-white font-mono text-[9px] uppercase tracking-widest font-bold rounded-xl flex items-center justify-center gap-2 border-t border-white/10 transition-all duration-300 cursor-pointer shadow-lg"
          >
            {proposalLoading ? (
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating Deal structure...</span>
            ) : (
              <>
                <Award className="w-3.5 h-3.5" />
                <span>Generate Client Proposal (₹ Deal)</span>
              </>
            )}
          </button>
        </div>

        {/* DIGITAL CHECKLIST & WEB DOMAIN STATUS */}
        <div className="bg-[#141922]/20 border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.05] pb-2.5">
            <Laptop className="w-3.5 h-3.5 text-[#4F8CFF]" />
            Digital Infrastructure Checklist
          </h4>

          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-white/50">Custom Website Domain Status:</span>
              {cafe.website === 'Y' ? (
                <span className="text-[#32D583] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Registered
                </span>
              ) : (
                <span className="text-[#EF4444] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unregistered
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/50">Table Reservation CRO Engine:</span>
              {cafe.website === 'Y' ? (
                <span className="text-[#32D583] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="text-[#EF4444] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing CRO
                </span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/50">Instagram local-boost integration:</span>
              <span className="text-[#F59E0B] font-bold flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5" /> Needs Overhaul
              </span>
            </div>
          </div>
        </div>

        {/* GOOGLE RATING & REVIEW TIMELINE */}
        <div className="space-y-3.5">
          <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
            Google Maps Review Timeline
          </h4>
          <div className="bg-[#141922]/20 border border-white/[0.06] rounded-2xl p-4.5 space-y-3.5 shadow-xl">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.05]">
              <span className="text-2xl font-space font-extrabold text-white">{cafe.rating}</span>
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <Star className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="text-[10px] font-mono text-white/40">({cafe.reviews} reviews indexed)</span>
            </div>

            <div className="space-y-3 text-[11px] leading-relaxed">
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1.5 font-sans text-white/70">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="font-bold text-white">Aniket Sharma (Local Guide)</span>
                  <span className="text-white/30">2 DAYS AGO</span>
                </div>
                <p>"Exceptional cold brew! Aesthetic atmosphere but they have no website to browse menu details. Please build one!"</p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1.5 font-sans text-white/70">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="font-bold text-white">Mehak Preet (Viewer)</span>
                  <span className="text-white/30">1 WEEK AGO</span>
                </div>
                <p>"Loved the matcha tea. It would be amazing to pre-book a table since the weekend rush is insane."</p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPETITOR BENCHMARK COMPARISON */}
        {topCompetitor && (
          <div className="bg-[#141922]/20 border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-xl">
            <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.05] pb-2.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#7C5CFF]" />
              Local Competitor Comparison (Area Leaders)
            </h4>

            <div className="space-y-3 font-mono text-[10px]">
              {/* This Cafe */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/50 text-[9px]">
                  <span>{cafe.name} (Active Cafe)</span>
                  <span className="font-bold text-white">{cafe.digitalPresenceScore}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] h-full rounded-full" style={{ width: `${cafe.digitalPresenceScore}%` }} />
                </div>
              </div>

              {/* Leader Cafe */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/40 text-[9px]">
                  <span>{topCompetitor.name} (Sector Lead Node)</span>
                  <span className="font-bold text-white">{topCompetitor.digitalPresenceScore}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#32D583] to-[#4F8CFF] h-full rounded-full" style={{ width: `${topCompetitor.digitalPresenceScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPATIAL NEARBY ESTABLISHMENTS */}
        {nearbyCafes.length > 0 && (
          <div className="bg-[#141922]/20 border border-white/[0.06] rounded-2xl p-5 space-y-3.5 shadow-xl">
            <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.05] pb-2.5">
              <Compass className="w-3.5 h-3.5 text-[#4F8CFF]" />
              Nearby establishments (Spatial Neighbor Nodes)
            </h4>

            <div className="grid grid-cols-2 gap-3.5">
              {nearbyCafes.map(nb => (
                <div key={nb.id} className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl space-y-1 font-mono text-[9px]">
                  <span className="block font-bold text-white truncate">{nb.name}</span>
                  <span className="block text-white/30">{nb.category}</span>
                  <span className="block text-[#4F8CFF] mt-1 font-bold">★ {nb.rating} ({nb.reviews} revs)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RULE-BASED BASIC RECOMMENDATIONS */}
        <div className="space-y-3.5">
          <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#32D583]" />
            Pipeline Recommendations
          </h4>
          <div className="space-y-2.5">
            {cafe.recommendationsList.map((rec, index) => (
              <div key={index} className="flex gap-2.5 p-3.5 bg-[#141922]/20 border border-white/[0.04] rounded-xl text-xs text-white/80 font-mono relative overflow-hidden group hover:border-[#4F8CFF]/20 transition-all duration-300">
                <Bookmark className="w-4 h-4 text-white/25 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GEMINI CONSULTANT AI SYSTEM */}
        <div className="border-t border-white/[0.06] pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-[#7C5CFF] animate-pulse" />
                Gemini Growth Consultant
              </h4>
              <p className="text-[8px] font-mono text-white/30 mt-1 uppercase tracking-widest">Generate a customized local strategy blueprint using AI</p>
            </div>
          </div>

          {!advisorLoading && !aiAdvice && (
            <button
              onClick={triggerAiAdvisor}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white font-bold uppercase tracking-widest text-[9px] font-mono rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] border-t border-white/15 transition-all duration-300 hover:opacity-95"
            >
              <Cpu className="w-4 h-4" />
              Generate Gemini Growth Blueprint
            </button>
          )}

          {advisorLoading && (
            <div className="bg-[#0E1117] border border-white/[0.08] rounded-xl p-5 font-mono space-y-4 shadow-2xl">
              <div className="flex justify-between items-center text-[9px] text-[#4F8CFF] uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-ping" />
                  DIAGNOSTIC PROCESSOR ACTIVE
                </span>
                <span>{diagnosticStep * 20 + 20}%</span>
              </div>
              
              <div className="space-y-1.5">
                {diagnostics.slice(0, diagnosticStep + 1).map((log, idx) => (
                  <p key={idx} className="text-[9px] text-white/40 flex items-center gap-1.5 animate-fadeIn">
                    <span className="text-[#7C5CFF] font-bold">&gt;</span> {log}
                  </p>
                ))}
              </div>

              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${diagnosticStep * 25 + 25}%` }}
                />
              </div>
            </div>
          )}

          {aiAdvice && (
            <div className="bg-[#0E1117] border border-white/[0.08] rounded-2xl p-5 shadow-2xl relative animate-fadeIn">
              <CustomMarkdownRenderer text={aiAdvice} />
              
              <button
                onClick={triggerAiAdvisor}
                className="mt-5 text-[9px] font-mono uppercase tracking-widest text-[#4F8CFF] hover:text-white flex items-center gap-1.5 cursor-pointer font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#7C5CFF]" />
                Re-generate blueprint
              </button>
            </div>
          )}

        </div>

      </div>

      {/* PROPOSAL PIPELINE LOADING MODAL */}
      {proposalLoading && (
        <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md z-50 flex flex-col justify-center p-8 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center text-[#4F8CFF] uppercase tracking-widest font-extrabold text-[9px] border-b border-white/[0.05] pb-3">
            <span className="flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#4F8CFF] animate-ping" />
              SaaS Deal Analyzer Active
            </span>
            <span>{proposalStep * 33 + 1}%</span>
          </div>
          
          <div className="space-y-2 text-white/50 text-[9px]">
            {proposalDiagnostics.slice(0, proposalStep + 1).map((log, idx) => (
              <p key={idx} className="flex items-center gap-1.5 animate-fadeIn">
                <span className="text-[#7C5CFF] font-bold">&gt;</span> {log}
              </p>
            ))}
          </div>

          <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] h-full transition-all duration-300 rounded-full"
              style={{ width: `${proposalStep * 33.3 + 10}%` }}
            />
          </div>
        </div>
      )}

      {/* COMPRESSED CLIENT PROPOSAL MODAL */}
      {proposal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fadeIn">
          <div className="bg-[#0E1117] border border-white/[0.08] w-full max-w-3xl rounded-3xl p-6 md:p-8 flex flex-col justify-between max-h-[90vh] overflow-hidden shadow-2xl relative">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#4F8CFF]/10 to-[#7C5CFF]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4.5">
              <div>
                <span className="text-[8px] font-mono font-bold text-[#4F8CFF] uppercase tracking-widest bg-[#4F8CFF]/10 px-2.5 py-1 rounded-full border border-[#4F8CFF]/20">
                  CONFIDENTIAL DIGITAL OVERHAUL DOSSIER
                </span>
                <h3 className="font-serif italic text-2xl text-white mt-2">Enterprise Client Growth Initiative</h3>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Client: {proposal.clientName} • Location: {proposal.location} • Scope: 12-Month Overhaul</p>
              </div>
              <button
                onClick={() => setProposal(null)}
                className="p-2 hover:bg-white/[0.04] text-white/40 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto my-6 pr-2 space-y-6 text-xs text-white/80 leading-relaxed font-sans">
              
              {/* Executive Metrics Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">GMB Diagnostic Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-space font-extrabold text-[#EF4444]">{proposal.score}/100</span>
                    <span className="text-[10px] font-mono text-[#EF4444] font-bold">Grade {proposal.grade}</span>
                  </div>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">Target Revenue Lift</span>
                  <span className="text-2xl font-space font-extrabold text-[#32D583] block mt-1">{proposal.revenueLift} /mo</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">12-Mo ROI Forecast</span>
                  <span className="text-2xl font-space font-extrabold text-white block mt-1">{proposal.roiPercentage}</span>
                </div>
              </div>

              {/* Solution Packages */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest border-b border-white/[0.05] pb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4F8CFF]" />
                  Custom Overhaul Modules
                </h4>
                <div className="space-y-3">
                  {proposal.modules.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h5 className="font-bold text-white flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#32D583]" />
                          {m.name}
                        </h5>
                        <p className="text-white/50 text-[11px] font-sans leading-relaxed">{m.desc}</p>
                      </div>
                      <span className="text-[#32D583] font-mono font-bold text-sm flex-shrink-0">{m.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Timeline */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest border-b border-white/[0.05] pb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  1-Month Rapid Deployment Timeline
                </h4>
                <div className="relative pl-6 space-y-4 border-l border-white/[0.06] ml-2">
                  {proposal.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-8 top-0.5 w-3.5 h-3.5 rounded-full bg-[#7C5CFF] border-2 border-[#0E1117] flex items-center justify-center text-[7px] font-bold text-white" />
                      <div className="flex gap-2 items-baseline">
                        <span className="font-mono text-[#7C5CFF] font-bold text-[10px] uppercase">{step.week}:</span>
                        <h5 className="font-bold text-white font-mono text-[11px]">{step.title}</h5>
                      </div>
                      <p className="text-white/40 text-[10px] leading-relaxed">{step.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5 mt-2">
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase">
                <ShieldCheck className="w-4 h-4 text-[#32D583]" />
                <span>CONFIDENTIAL DEPLOYMENT SAFEGUARDED</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const docText = `GEOVISION ENTERPRISE DIGITAL OVERHAUL PROPOSAL
====================================================
CLIENT: ${proposal.clientName}
LOCATION: ${proposal.location}
DATE: ${proposal.date}
RATING INDEX: ${proposal.score}/100 (Grade: ${proposal.grade})

1. FINANCIAL INVESTMENT
-----------------------
${proposal.modules.map((m: any, i: number) => `[Module ${i + 1}] ${m.name}\nCost: ${m.cost}\nDetails: ${m.desc}`).join('\n\n')}

TOTAL ONE-TIME CONTRACT INVESTMENT: ${proposal.totalCost}
PROJECTED MONTHLY REVENUE LIFT: ${proposal.revenueLift}
12-MONTH FORECAST INVESTMENT ROI: ${proposal.roiPercentage}

2. FOUR-WEEK DEPLOYMENT SCHEDULE
--------------------------------
${proposal.timeline.map((t: any) => `- ${t.week}: ${t.title}\n  Details: ${t.details}`).join('\n')}

====================================================
CONFIDENTIAL • FOR REGIONAL INTERNAL DEVELOPMENT ONLY`;

                    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute('download', `${proposal.clientName.replace(/\s+/g, '_')}_overhaul_proposal.txt`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white hover:opacity-90 font-mono text-[9px] uppercase tracking-widest font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download Strategic Proposal
                </button>
                <button
                  onClick={() => setProposal(null)}
                  className="px-4.5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
