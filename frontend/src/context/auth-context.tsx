'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export type Role = 'BUYER' | 'SELLER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  roles: Role[];
  activeRole: Role | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  updateActiveRole: (role: Role) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If token is invalid or expired, clear it
      Cookies.remove('token');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        await fetchProfile();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 1 }); // expires in 1 days
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Inform the backend
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Failed to call logout API:', error);
    } finally {
      // Clear token cookie and user state regardless
      Cookies.remove('token');
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const updateActiveRole = async (role: Role): Promise<User> => {
    try {
      const response = await api.patch<User>('/auth/active-role', { activeRole: role });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update active role:', error);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<User | null> => {
    return await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, //change to boolean value
        isLoading,
        login,
        logout,
        updateActiveRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
