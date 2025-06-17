
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  register: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin users
const ALLOWED_ADMIN_USERS = [
  { username: 'MVP', password: '101416Saka' },
  { username: 'MSP', password: 'Royal2025' },
];

const AUTH_STORAGE_KEY = 'mtTabacariaAuthUser'; // Stores the currently logged-in user (admin or client)
const CLIENT_USERS_STORAGE_KEY = 'mtTabacariaClientUsers'; // Stores registered client accounts

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

  const getClientUsers = (): User[] => {
    try {
      const storedClientUsers = localStorage.getItem(CLIENT_USERS_STORAGE_KEY);
      return storedClientUsers ? JSON.parse(storedClientUsers) : [];
    } catch (error) {
      console.error("Failed to load client users from localStorage:", error);
      return [];
    }
  };

  const saveClientUsers = (clientUsers: User[]) => {
    try {
      localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(clientUsers));
    } catch (error) {
      console.error("Failed to save client users to localStorage:", error);
    }
  };

  const register = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    const clientUsers = getClientUsers();
    const isAdmin = ALLOWED_ADMIN_USERS.some(admin => admin.username === usernameInput);
    const clientExists = clientUsers.some(client => client.username === usernameInput);

    if (isAdmin || clientExists) {
      toast({
        title: "Falha no Registro",
        description: "Nome de usuário já existe.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }

    // In a real app, hash the password before saving
    const newClient: User = { username: usernameInput, role: 'client' };
    const updatedClientUsers = [...clientUsers, { ...newClient, password: passwordInput }]; // Storing password directly for prototype

    // Simulate saving to DB
    localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(updatedClientUsers.map(u => ({username: u.username, password: (u as any).password, role: u.role }))));


    toast({
      title: "Registro Bem-Sucedido",
      description: "Sua conta foi criada. Faça o login.",
      variant: "default",
    });
    setIsLoading(false);
    return true;
  }, [toast]);


  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);

    // Check for admin user
    const foundAdmin = ALLOWED_ADMIN_USERS.find(
      (u) => u.username === usernameInput && u.password === passwordInput
    );

    if (foundAdmin) {
      const adminData: User = { username: foundAdmin.username, role: 'admin' };
      setUser(adminData);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData));
      } catch (error) {
        console.error("Failed to save admin user to localStorage:", error);
      }
      setIsLoading(false);
      return true;
    }

    // Check for client user
    const clientUsersWithPasswords = getClientUsers(); // This should retrieve users with their passwords stored for prototype
    const foundClient = clientUsersWithPasswords.find(
      (u: any) => u.username === usernameInput && u.password === passwordInput
    );


    if (foundClient) {
      const clientData: User = { username: foundClient.username, role: 'client' };
      setUser(clientData);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(clientData));
      } catch (error) {
        console.error("Failed to save client user to localStorage:", error);
      }
      setIsLoading(false);
      return true;
    }
    
    toast({
      title: "Falha no Login",
      description: "Usuário ou senha inválidos.",
      variant: "destructive",
    });
    setIsLoading(false);
    return false;
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
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
