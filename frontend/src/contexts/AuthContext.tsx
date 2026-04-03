import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMeApi, loginApi, signupApi } from '@/lib/api/auth';
import { getApiError } from '@/lib/apiClient';
import type { SignupPayload } from '@/lib/api/auth';

type UserRole = 'client' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_superuser: boolean;
  phone_number?: string | null;
  address?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRole(isAdmin: boolean, isSuperuser: boolean): UserRole {
  return isAdmin || isSuperuser ? 'admin' : 'client';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchMe() {
    try {
      const me = await getMeApi();
      setUser({
        id: me.id,
        name: me.full_name ?? me.email,
        email: me.email,
        role: mapRole(me.is_admin, me.is_superuser),
        is_superuser: me.is_superuser,
        phone_number: me.phone_number,
        address: me.address,
      });
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const token = await loginApi(email, password);
    localStorage.setItem('access_token', token.access_token);
    await fetchMe();
    // fetchMe updates state but we need the value immediately for redirect
    const me = await getMeApi();
    const resolved: User = {
      id: me.id,
      name: me.full_name ?? me.email,
      email: me.email,
      role: mapRole(me.is_admin, me.is_superuser),
      is_superuser: me.is_superuser,
      phone_number: me.phone_number,
      address: me.address,
    };
    return resolved;
  }

  async function signup(payload: SignupPayload): Promise<User> {
    await signupApi(payload);
    const token = await loginApi(payload.email, payload.password);
    localStorage.setItem('access_token', token.access_token);
    await fetchMe();
    const me = await getMeApi();
    const resolved: User = {
      id: me.id,
      name: me.full_name ?? me.email,
      email: me.email,
      role: mapRole(me.is_admin, me.is_superuser),
      is_superuser: me.is_superuser,
      phone_number: me.phone_number,
      address: me.address,
    };
    return resolved;
  }

  function logout() {
    localStorage.removeItem('access_token');
    setUser(null);
  }

  async function refreshUser() {
    await fetchMe();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
