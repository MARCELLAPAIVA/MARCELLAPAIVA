
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded users for prototype purposes
const ALLOWED_USERS = [
  { username: 'MVP', password: '101416Saka' },
  { username: 'MSP', password: 'Royal2025' },
];

const AUTH_STORAGE_KEY = 'mtTabacariaAuthUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    const foundUser = ALLOWED_USERS.find(
      (u) => u.username === usernameInput && u.password === passwordInput
    );

    if (foundUser) {
      const userData = { username: foundUser.username };
      setUser(userData);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to save user to localStorage:", error);
      }
      setIsLoading(false);
      return true;
    } else {
      toast({
        title: "Falha no Login",
        description: "Usuário ou senha inválidos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove user from localStorage:", error);
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

