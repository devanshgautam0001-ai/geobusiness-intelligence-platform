export interface Cafe {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  area: string;
  city: string;
  website: 'Y' | 'N';
  phone: string;
  latitude: number;
  longitude: number;
  hours: string;
  digitalPresenceScore: number;
  growthOpportunityScore: number;
  recommendation: string;
  recommendationsList: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  passwordHash?: string;
  profilePicture?: string;
  lastLogin?: string;
  memberSince?: string;
}

export interface AreaAnalytic {
  area: string;
  city: string;
  cafeCount: number;
  averageRating: number;
  averageReviews: number;
  websitePercentage: number;
  avgDigitalPresenceScore: number;
  avgGrowthOpportunityScore: number;
}

export interface CategoryAnalytic {
  category: string;
  cafeCount: number;
  averageRating: number;
  averageReviews: number;
  websitePercentage: number;
}

export interface DashboardKPIs {
  totalCafes: number;
  averageRating: number;
  averageReviews: number;
  websitePercentage: number;
  noWebsitePercentage: number;
  topOpportunityCafes: Cafe[];
  topRatedCafes: Cafe[];
  areaDistribution: { name: string; value: number }[];
  reviewDistribution: { name: string; value: number }[];
}
