
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/manage');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await login(username, password);
    if (success) {
      router.push('/manage');
    }
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-primary text-xl">Carregando...</p> {/* Primary here is dark gray, might need adjustment if it looks off */}
      </div>
    );
  }
  
  if (user) {
    return null; 
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-250px)] py-12">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl"> {/* Card bg is light gray, border is light gray */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-foreground">Acesso Restrito</CardTitle> {/* Text foreground is near black */}
          <CardDescription className="text-muted-foreground font-body">
            Entre com suas credenciais para gerenciar produtos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-headline">Usuário</Label> {/* Text foreground is near black */}
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary" // input bg is very light gray, primary focus is dark gray
                placeholder="Seu usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-headline">Senha</Label> {/* Text foreground is near black */}
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
              {/* Primary bg is dark gray, text is white */}
              {isSubmitting ? "Entrando..." : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
