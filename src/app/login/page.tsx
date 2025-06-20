
"use client";

import { Suspense, useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      // User status is handled by AuthContext toasts (e.g. if admin manually set to pending/rejected)
      // For login, we primarily care if they are approved to redirect.
      if (user.status === 'approved') {
        if (user.role === 'admin') {
          router.push('/manage');
        } else if (user.role === 'client') {
          const redirectUrl = searchParams.get('redirect') || '/';
          router.push(redirectUrl);
        }
      } else if (user.status === 'pending') {
        // AuthContext will show a toast. User remains on login page.
        // Or redirect to a specific "pending approval" page if desired.
      } else if (user.status === 'rejected') {
        // AuthContext will show a toast. User remains on login page.
      }
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    // If login initiated successfully, onAuthStateChanged and useEffect will handle redirection/toasts.
    // If login call itself failed (e.g. bad creds), login() shows a toast.
    if (!success) {
      setIsSubmitting(false); // Re-enable button only if login attempt failed pre-auth-state-change
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Carregando...</p>
      </div>
    );
  }
  
  // If user is approved, useEffect will redirect. Show interim message.
  if (user && user.status === 'approved' && !authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Redirecionando...</p>
      </div>
    );
  }

  // If user is pending/rejected (from manual admin change) or not logged in, show form.
  // Toasts for pending/rejected are handled by AuthContext.
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
              {isSubmitting || (authLoading && !user) ? "Entrando..." : (
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Carregando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
