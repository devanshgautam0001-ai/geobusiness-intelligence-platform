import { Cafe, DashboardKPIs } from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('geobi_jwt');
}

export function setAuthToken(token: string) {
  localStorage.setItem('geobi_jwt', token);
}

export function clearAuthToken() {
  localStorage.removeItem('geobi_jwt');
}

export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function request(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  signup: async (signupData: any) => {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
    setAuthToken(data.token);
    return data;
  },
  
  getMe: async () => {
    return request('/auth/me');
  },

  updateProfile: async (profileData: { name?: string; profilePicture?: string }) => {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData: any) => {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  // Cafes
  getCafes: async (filters: {
    search?: string;
    city?: string;
    category?: string;
    website?: string;
    minRating?: number;
    minOpportunity?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Cafe[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/cafes${queryStr}`);
  },

  getCafeById: async (id: string): Promise<Cafe> => {
    return request(`/cafes/${id}`);
  },

  createCafe: async (cafeData: Partial<Cafe>): Promise<Cafe> => {
    return request('/cafes', {
      method: 'POST',
      body: JSON.stringify(cafeData),
    });
  },

  updateCafe: async (id: string, cafeData: Partial<Cafe>): Promise<Cafe> => {
    return request(`/cafes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cafeData),
    });
  },

  deleteCafe: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request(`/cafes/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  getAnalytics: async (): Promise<DashboardKPIs & { categoryDistribution: any[] }> => {
    return request('/analytics');
  },

  // Gemini AI Recommendation
  getGeminiAdvice: async (cafeId: string): Promise<{ advice: string }> => {
    return request('/recommendations/gemini', {
      method: 'POST',
      body: JSON.stringify({ cafeId }),
    });
  },

  // AI Chat Consultant
  aiChat: async (chatParams: { message?: string; cafeId?: string; action?: string }): Promise<{ response: string }> => {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(chatParams),
    });
  },
};
