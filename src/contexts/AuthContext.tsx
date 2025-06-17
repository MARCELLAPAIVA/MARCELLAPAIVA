
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { User as AppUser } from '@/lib/types'; 
import { auth as firebaseAuthService } from '@/lib/firebase'; 
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

// IMPORTANT: Update with actual admin emails for registration and role assignment
const ADMIN_EMAILS = ['mvp@tabacaria.com', 'msp@tabacaria.com']; 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseAuthService) {
      console.error("Firebase Auth service (firebaseAuthService) is not properly initialized. Check Firebase configuration in src/lib/firebase.ts and ensure Authentication is enabled in the Firebase console. Auth features will not work.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthService, (firebaseUser: FirebaseUser | null) => {
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
    if (!firebaseAuthService) {
      console.error("Firebase Auth service not initialized. Cannot register user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      await updateProfile(userCredential.user, { displayName: usernameInput });
      
      const role = ADMIN_EMAILS.includes(userCredential.user.email || '') ? 'admin' : 'client';
      setUser({ 
        uid: userCredential.user.uid, 
        email: userCredential.user.email, 
        displayName: usernameInput,
        role: role 
      });

      toast({
        title: "Registro Bem-Sucedido",
        description: "Sua conta foi criada. Você já está logado.",
        variant: "default",
      });
      return true;
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      let description = "Ocorreu um erro desconhecido durante o registro.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este email já está em uso por outra conta.";
      } else if (error.code === 'auth/weak-password') {
        description = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        description = "O formato do email fornecido não é válido.";
      }
      toast({ title: "Falha no Registro", description, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    if (!firebaseAuthService) {
      console.error("Firebase Auth service not initialized. Cannot login user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      return true;
    } catch (error: any) {
      console.error("Firebase login error:", error);
      let description = "Email ou senha inválidos. Verifique suas credenciais.";
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email ou senha incorretos. Tente novamente.";
      } else if (error.code === 'auth/invalid-email') {
        description = "O formato do email fornecido não é válido.";
      }
      toast({ title: "Falha no Login", description, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    if (!firebaseAuthService) {
      console.error("Firebase Auth service not initialized. Cannot logout user.");
    }
    setIsLoading(true);
    try {
      await signOut(firebaseAuthService);
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
