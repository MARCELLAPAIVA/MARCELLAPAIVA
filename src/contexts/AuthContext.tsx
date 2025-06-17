
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
  type User as FirebaseUser
} from 'firebase/auth';
import { getUserData, setUserData } from '@/lib/userService'; // Import user service
import { serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<boolean>;
  register: (emailInput: string, passwordInput: string, usernameInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// IMPORTANTE: Mantenha esta lista atualizada com os emails dos usuários
// que devem ter privilégios de administrador.
// Qualquer usuário que se registrar pelo site e não estiver nesta lista
// terá o papel 'client' e status 'pending' (aguardando aprovação).
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

    const unsubscribe = onAuthStateChanged(firebaseAuthService, async (firebaseUser: FirebaseUser | null) => {
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
          
          // Handle redirection/toasts based on status after user state is set
          if (appUser.status === 'pending') {
             toast({ title: "Conta Pendente", description: "Sua conta está aguardando aprovação do administrador.", variant: "default", duration: 7000 });
          } else if (appUser.status === 'rejected') {
             toast({ title: "Conta Rejeitada", description: "Sua conta foi rejeitada. Entre em contato com o suporte.", variant: "destructive", duration: 7000 });
          }

        } else {
          // User exists in Auth, but not in Firestore.
          const isUserAdminByEmail = ADMIN_EMAILS.includes(firebaseUser.email || '');
          if (isUserAdminByEmail) {
            const adminRole: UserRole = 'admin';
            const adminStatus: UserStatus = 'approved';
            await setUserData(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: adminRole,
              status: adminStatus,
              createdAt: serverTimestamp(),
            });
            const newAdminUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: adminRole,
              status: adminStatus,
            };
            setUser(newAdminUser);
          } else {
            // Non-admin user in Auth without Firestore doc - this is an inconsistent state or a new client registration that hasn't populated Firestore yet.
            // If it was a registration, AuthContext.register would have handled it.
            // This case implies an existing Auth user without a Firestore doc, not on admin list.
            console.error(`AuthContext: User ${firebaseUser.uid} exists in Auth but not in Firestore and is not in ADMIN_EMAILS. This could be a partially completed registration or an anomaly. Logging out for safety.`);
            toast({ title: "Erro de Conta", description: "Não foi possível carregar os dados da sua conta. Por favor, tente fazer login novamente ou registre-se.", variant: "destructive", duration: 7000 });
            await signOut(firebaseAuthService); 
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]); 

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

      const isUserAdmin = ADMIN_EMAILS.includes(emailInput);
      const initialRole: UserRole = isUserAdmin ? 'admin' : 'client';
      const initialStatus: UserStatus = isUserAdmin ? 'approved' : 'pending'; // Clientes ficam pendentes

      await setUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: usernameInput,
        role: initialRole,
        status: initialStatus,
        createdAt: serverTimestamp(),
      });
      
      if (initialStatus === 'pending') {
        toast({
          title: "Cadastro Realizado!",
          description: "Sua conta foi criada e está aguardando aprovação do administrador.",
          variant: "default",
          duration: 7000,
        });
      } else { // Admin (auto-approved)
         toast({
          title: "Registro de Administrador Bem-Sucedido!",
          description: "Sua conta de administrador foi criada e está ativa.",
          variant: "default",
        });
      }
      // User state will be updated by onAuthStateChanged which listens to Firebase Auth state.
      // signInWithEmailAndPassword is not needed here after registration, onAuthStateChanged handles it.
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
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot login user.");
      toast({ title: "Erro de Configuração", description: "Não foi possível conectar ao serviço de autenticação.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuthService, emailInput, passwordInput);
      // onAuthStateChanged will handle fetching user data from Firestore (including status)
      // and setting the user state. Page useEffects will then handle redirection based on this status.
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
    if (!firebaseAuthService) {
      console.error("AuthContext: Firebase Auth service not initialized. Cannot logout user.");
    }
    setIsLoading(true);
    try {
      await signOut(firebaseAuthService);
      setUser(null); 
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

