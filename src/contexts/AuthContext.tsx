
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
      console.error("AuthContext: Firebase Auth service (firebaseAuthService) is not properly initialized. Check Firebase configuration in src/lib/firebase.ts and ensure Authentication is enabled in the Firebase console. Auth features will not work.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthService, (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true); // Set loading true while processing auth state
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
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const register = useCallback(async (emailInput: string, passwordInput: string, usernameInput: string): Promise<boolean> => {
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot register user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      await updateProfile(userCredential.user, { displayName: usernameInput });
      
      // setUser will be updated by onAuthStateChanged, but we can show toast immediately
      toast({
        title: "Registro Bem-Sucedido!",
        description: "Sua conta foi criada. Você já está logado.",
        variant: "default", // Changed from "success" to "default" as per ShadCN
      });
      // No need to manually set user here, onAuthStateChanged will handle it.
      return true;
    } catch (error: any) {
      console.error("AuthContext: Firebase registration error:", error);
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
  }, [toast]); // router is not needed here

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot login user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      // setUser will be updated by onAuthStateChanged
      // Toast for login success can be shown here or after redirection based on role (handled in login page)
      return true;
    } catch (error: any) {
      console.error("AuthContext: Firebase login error:", error);
      let description = "Email ou senha inválidos. Verifique suas credenciais.";
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email ou senha incorretos. Tente novamente.";
      } else if (error.code === 'auth/invalid-email') {
        description = "O formato do email fornecido não é válido.";
      }
      // Consider more specific error codes if needed: e.g. auth/too-many-requests
      toast({ title: "Falha no Login", description, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // router is not needed here

  const logout = useCallback(async () => {
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot logout user.");
      // Optionally, show a toast here if desired, though usually logout errors are less critical for user UX
    }
    setIsLoading(true);
    try {
      await signOut(firebaseAuthService);
      // setUser will be set to null by onAuthStateChanged
      router.push('/login'); // Redirect after logout
    } catch (error) {
      console.error("AuthContext: Firebase logout error:", error);
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
    throw new Error('useAuth must be used within an AuthProvider. Ensure your component is wrapped by AuthProvider.');
  }
  return context;
};
