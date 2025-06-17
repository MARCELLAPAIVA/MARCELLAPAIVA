
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast(); 

  useEffect(() => {
    if (!authLoading && user) {
      // AuthContext.register or onAuthStateChanged will show toasts for pending/rejected.
      // We only redirect if 'approved'.
      if (user.status === 'approved') {
        if (user.role === 'admin') {
          router.push('/manage');
        } else {
          router.push('/');
        }
      } else if (user.status === 'pending') {
        // User remains on register page. Toast is handled by AuthContext.
        // If registration was successful, AuthContext.register shows "aguardando aprovação" toast.
      } else if (user.status === 'rejected') {
        // User remains on register page. Toast is handled by AuthContext.
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError('');
    setIsSubmitting(true);
    const success = await register(email, password, username);
    // If registration call was successful (returned true), AuthContext.register shows a success/pending toast.
    // onAuthStateChanged in AuthContext will update user state.
    // The useEffect above will handle redirection if status eventually becomes 'approved'.
    if (!success) {
      setIsSubmitting(false); // Only set to false if registration call failed (AuthContext.register shows error toast)
    }
    // Don't setIsSubmitting(false) on success, as status messages or redirection will occur.
    // If status is 'pending', user stays on this page, button remains disabled until message is seen.
    // If register returns true (meaning it initiated), we can consider clearing form or keeping button disabled.
    // For now, if 'pending', they will see the toast and button might re-enable after authLoading is false.
  };

  if (authLoading && !user) { // Show loading only if no user data yet and auth is loading
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Carregando...</p>
      </div>
    );
  }

  if (user && user.status === 'approved' && !authLoading) {
    // User is approved and loaded, useEffect will redirect.
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Redirecionando...</p>
      </div>
    );
  }
  
  // If user is loaded but status is pending/rejected, or no user and not loading, render the form.
  // Toasts for pending/rejected are handled by AuthContext.

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-250px)] py-12">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-foreground">Criar Conta</CardTitle>
          <CardDescription className="text-muted-foreground font-body">
            Crie sua conta para visualizar preços e mais. Seu cadastro passará por aprovação.
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
              <Label htmlFor="username" className="text-foreground font-headline">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="Como você gostaria de ser chamado(a)"
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
                minLength={6}
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="Crie uma senha (mín. 6 caracteres)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-headline">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="Confirme sua senha"
              />
            </div>
            {error && <p className="text-sm text-destructive font-body">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-3 rounded-md" disabled={isSubmitting || authLoading}>
              {isSubmitting || (authLoading && !user) ? "Criando conta..." : ( // Show "Criando..." if submitting or initial auth load without user
                <>
                  <UserPlus size={20} className="mr-2" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground font-body">
              Já tem uma conta?{' '}
              <Button variant="link" asChild className="text-primary hover:text-primary/80 p-0 h-auto">
                <Link href="/login">
                  Faça login <LogIn size={16} className="ml-1" />
                </Link>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

