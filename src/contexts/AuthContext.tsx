
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { User as AppUser } from '@/lib/types'; // Renamed to avoid conflict
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  type User as FirebaseUser 
} from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<boolean>;
  register: (emailInput: string, passwordInput: string, usernameInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define admin emails here. Users registering with these emails will get 'admin' role.
const ADMIN_EMAILS = ['mvp@tabacaria.com', 'msp@tabacaria.com']; // IMPORTANT: Update with actual admin emails

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const role = ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'admin' : 'client';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: role,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = useCallback(async (emailInput: string, passwordInput: string, usernameInput: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      await updateProfile(userCredential.user, { displayName: usernameInput });
      
      // Update local user state immediately for better UX, onAuthStateChanged will also fire
      const role = ADMIN_EMAILS.includes(userCredential.user.email || '') ? 'admin' : 'client';
      setUser({ 
        uid: userCredential.user.uid, 
        email: userCredential.user.email, 
        displayName: usernameInput, // or userCredential.user.displayName after updateProfile
        role: role 
      });

      toast({
        title: "Registro Bem-Sucedido",
        description: "Sua conta foi criada. Você já está logado.",
        variant: "default",
      });
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      let description = "Ocorreu um erro desconhecido.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este email já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        description = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        description = "O email fornecido não é válido.";
      }
      toast({
        title: "Falha no Registro",
        description: description,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      // onAuthStateChanged will handle setting the user state
      // No need to show success toast here, redirection will indicate success
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast({
        title: "Falha no Login",
        description: "Email ou senha inválidos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
      router.push('/login'); 
    } catch (error) {
      console.error("Firebase logout error:", error);
      toast({
        title: "Erro ao Sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

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
