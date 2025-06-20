
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeAuthSection() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <section className="py-6 sm:py-8 text-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-muted h-12 w-12"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
            <div className="h-11 bg-muted rounded-full w-full"></div>
            <div className="h-11 bg-muted rounded-full w-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (user) {
    const displayName = user.displayName || user.email;

    // Since new users are auto-approved, 'pending' and 'rejected' states
    // are less common for initial view unless an admin manually changed status.
    // AuthContext will show toasts for these states if they occur.
    // We simplify this component to mostly show the 'approved' state.

    if (user.status === 'pending') {
      // This state might occur if an admin manually sets a user to pending.
      return (
        <section className="py-6 sm:py-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle size={48} className="text-amber-500" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Olá, {displayName}!</h2>
              <p className="text-muted-foreground">Sua conta está atualmente pendente de revisão.</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Aguarde ou entre em contato com o suporte.</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
              <Button variant="outline" onClick={logout} className="w-full text-foreground border-foreground/50 hover:bg-muted text-base py-3 rounded-full">
                Sair
              </Button>
            </div>
          </div>
        </section>
      );
    }

    if (user.status === 'rejected') {
      // This state might occur if an admin manually sets a user to rejected.
      return (
        <section className="py-6 sm:py-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle size={48} className="text-destructive" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
              <p className="text-muted-foreground">Olá, {displayName}. Seu acesso à conta foi restringido.</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Entre em contato com o suporte para mais informações.</p>
            </div>
             <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
               <Button variant="outline" onClick={logout} className="w-full text-foreground border-foreground/50 hover:bg-muted text-base py-3 rounded-full">
                Sair
              </Button>
            </div>
          </div>
        </section>
      );
    }

    // User is 'approved' (default for new users now)
    return (
      <section className="py-6 sm:py-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle2 size={48} className="text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Bem-vindo(a), {displayName}!</h2>
            {user.role === 'admin' && (
              <p className="text-muted-foreground">Você está logado como administrador.</p>
            )}
            {user.role === 'client' && (
              <p className="text-muted-foreground">Explore nossos produtos e veja os preços.</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
            {user.role === 'admin' && (
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full">
                <Link href="/manage">Gerenciar Loja</Link>
              </Button>
            )}
             <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full">
                <Link href="/">Ver Produtos</Link>
              </Button>
            <Button variant="outline" onClick={logout} className="w-full text-foreground border-foreground/50 hover:bg-muted text-base py-3 rounded-full">
              Sair
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // User is not logged in
  return (
    <section className="py-6 sm:py-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <UserCircle2 size={48} className="text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Olá!</h2>
          <p className="text-muted-foreground">Crie uma conta ou faça login para visualizar os preços.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="outline" asChild className="w-full text-foreground border-foreground/50 hover:bg-muted text-base py-3 rounded-full">
            <Link href="/register">
                Criar Conta <UserPlus size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

