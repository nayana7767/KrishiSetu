import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from '../i18n/translations';

export interface FarmerProfile {
  id: number;
  user_id: number;
  district: string;
  taluk: string;
  village: string;
  land_acres: number;
  land_ownership: string;
  crops: string;
  crop_season: string;
  irrigation_type: string;
  farmer_category: string;
  fruits_id?: string;
  has_kcc: boolean;
  annual_income: number;
}

export interface MachineryProviderProfile {
  id: number;
  user_id: number;
  business_name: string;
  contact_name: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  is_verified: boolean;
  rating: number;
}

export interface User {
  id: number;
  email: string;
  phone: string;
  full_name: string;
  role: 'farmer' | 'provider' | 'admin';
  preferred_language: Language;
  is_active: boolean;
  farmer_profile?: FarmerProfile;
  machinery_provider?: MachineryProviderProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateFarmerProfile: (profileData: Partial<FarmerProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('krishisetu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('krishisetu_token') || null;
  });

  const { setLanguage } = useLanguage();

  const login = async (emailOrPhone: string, pass: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password: pass })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || 'Login failed' };
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('krishisetu_token', data.access_token);
      localStorage.setItem('krishisetu_user', JSON.stringify(data.user));

      if (data.user.preferred_language) {
        setLanguage(data.user.preferred_language as Language);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  const register = async (formData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || 'Registration failed' };
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('krishisetu_token', data.access_token);
      localStorage.setItem('krishisetu_user', JSON.stringify(data.user));

      if (data.user.preferred_language) {
        setLanguage(data.user.preferred_language as Language);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('krishisetu_token');
    localStorage.removeItem('krishisetu_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const freshUser = await response.json();
        setUser(freshUser);
        localStorage.setItem('krishisetu_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const updateFarmerProfile = async (profileData: Partial<FarmerProfile>) => {
    if (!token) return false;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_update: {},
          farmer_update: profileData
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        localStorage.setItem('krishisetu_user', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateFarmerProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
