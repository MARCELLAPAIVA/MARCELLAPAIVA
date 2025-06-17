
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.status === 'pending') {
        // Toast is handled by AuthContext's onAuthStateChanged or register function
        // User remains on login/register page or a dedicated "awaiting approval" page.
        // No direct redirection from here is needed for 'pending'.
        return;
      }
      if (user.status === 'rejected') {
        // Toast is handled by AuthContext's onAuthStateChanged
        // User remains on login/register page.
        return;
      }
      // Only redirect if 'approved'
      if (user.status === 'approved') {
        if (user.role === 'admin') {
          router.push('/manage');
        } else if (user.role === 'client') {
          const redirectUrl = searchParams.get('redirect') || '/';
          router.push(redirectUrl);
        }
      }
    }
  }, [user, authLoading, router, searchParams, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    // If login initiated successfully, onAuthStateChanged in AuthContext will handle user state
    // and the useEffect above will handle redirection based on status.
    // If login itself fails (e.g., wrong password before checking status), AuthContext.login shows a toast.
    if (!success) {
      setIsSubmitting(false); // Only set to false if login initiation failed
    }
    // Don't setIsSubmitting(false) on success, as redirection or status messages will occur via useEffect.
  };

  if (authLoading && !user) { // Show loading only if no user data yet and auth is loading
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Carregando...</p>
      </div>
    );
  }
  
  // If user is loaded and approved, they will be redirected by useEffect. Show "Redirecionando..."
  if (user && user.status === 'approved' && !authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Redirecionando...</p>
      </div>
    );
  }

  // If user is loaded but status is pending/rejected, they should not see "Redirecionando..."
  // They remain on the login page to see toasts from AuthContext.
  // The form is rendered below for them to retry or see messages.

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-250px)] py-12">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-foreground">Login</CardTitle>
          <CardDescription className="text-muted-foreground font-body">
            Acesse sua conta ou o painel de gerenciamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-headline">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-headline">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="Sua senha"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-3 rounded-md" disabled={isSubmitting || authLoading}>
              {isSubmitting || (authLoading && !user) ? "Entrando..." : ( // Show "Entrando..." if submitting or initial auth load without user
                <>
                  <LogIn size={20} className="mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground font-body">
              Não tem uma conta?{' '}
              <Button variant="link" asChild className="text-primary hover:text-primary/80 p-0 h-auto">
                <Link href="/register">
                  Crie aqui <UserPlus size={16} className="ml-1" />
                </Link>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

