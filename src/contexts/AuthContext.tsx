
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { User as AppUser, UserStatus, UserRole } from '@/lib/types';
import { auth as firebaseAuthService } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
  setPersistence, // Added
  browserSessionPersistence // Added
} from 'firebase/auth';
import { getUserData, setUserData } from '@/lib/userService';
import { serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<boolean>;
  register: (emailInput: string, passwordInput: string, usernameInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mvp@mttabacaria.com', 'msp@mttabacaria.com', 'jpv@mttabacaria.com', 'phv@mttabacaria.com'];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service (firebaseAuthService) is not properly initialized.");
      setIsLoading(false);
      return;
    }

    let unsubscribeAuthStateChanged: (() => void) | null = null;

    const initializeAuthFlow = async () => {
      try {
        await setPersistence(firebaseAuthService, browserSessionPersistence);
        console.log("AuthContext: Firebase Auth persistence set to 'session'.");
      } catch (error) {
        console.error("AuthContext: Error setting auth persistence to session:", error);
        // If setting persistence fails, app will proceed with default (local) persistence.
      }

      unsubscribeAuthStateChanged = onAuthStateChanged(firebaseAuthService, async (firebaseUser: FirebaseUser | null) => {
        setIsLoading(true); 
        if (firebaseUser) {
          const userDataFromFirestore = await getUserData(firebaseUser.uid);

          if (userDataFromFirestore) {
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: userDataFromFirestore.role,
              status: userDataFromFirestore.status, 
              createdAt: userDataFromFirestore.createdAt,
            };
            setUser(appUser);
            
            if (appUser.status === 'pending') {
               toast({ title: "Conta Pendente", description: "Sua conta ainda está aguardando aprovação do administrador.", variant: "default", duration: 7000 });
            } else if (appUser.status === 'rejected') {
               toast({ title: "Conta Rejeitada", description: "Sua conta foi rejeitada. Entre em contato com o suporte.", variant: "destructive", duration: 7000 });
            }

          } else {
            const isUserAdminByEmail = ADMIN_EMAILS.includes(firebaseUser.email || '');
            const newRole: UserRole = isUserAdminByEmail ? 'admin' : 'client';
            const newStatus: UserStatus = 'approved'; 

            await setUserData(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName, 
              role: newRole,
              status: newStatus,
              createdAt: serverTimestamp(),
            });
            const newUserDoc: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: newRole,
              status: newStatus,
            };
            setUser(newUserDoc);
             toast({ title: "Bem-vindo(a)!", description: "Sua conta está ativa.", variant: "default" });
          }
        } else {
          setUser(null); 
        }
        setIsLoading(false); 
      });
    };

    initializeAuthFlow();

    return () => {
      if (unsubscribeAuthStateChanged) {
        unsubscribeAuthStateChanged();
      }
    };
  }, [toast]); 

  const register = useCallback(async (emailInput: string, passwordInput: string, usernameInput: string): Promise<boolean> => {
    setIsLoading(true);
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot register user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      await updateProfile(userCredential.user, { displayName: usernameInput });

      const isUserAdmin = ADMIN_EMAILS.includes(emailInput);
      const initialRole: UserRole = isUserAdmin ? 'admin' : 'client';
      const initialStatus: UserStatus = 'approved'; 

      await setUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: usernameInput,
        role: initialRole,
        status: initialStatus,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Cadastro Realizado!",
        description: "Sua conta foi criada e está ativa.",
        variant: "default",
        duration: 7000,
      });
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
  }, [toast]);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot login user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }

    try {
      await signInWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      return true;
    } catch (error: any) {
      console.error("AuthContext: Firebase login error:", error);
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
    setIsLoading(true);
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot logout user.");
      toast({
        title: "Erro de Configuração",
        description: "Serviço de autenticação indisponível para sair.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await signOut(firebaseAuthService);
      router.push('/login'); 
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

    