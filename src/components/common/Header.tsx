
"use client";

import Link from 'next/link';
import { ShoppingBag, LogIn, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <ShoppingBag size={32} />
          <h1 className="text-3xl font-headline font-bold">
            M&amp;T Tabacaria
          </h1>
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Produtos
              </Link>
            </li>
            {isLoading ? (
              <li>
                <div className="h-6 w-20 bg-muted/50 animate-pulse rounded-md"></div>
              </li>
            ) : user ? (
              <>
                <li>
                  <Link href="/manage" className="flex items-center text-foreground hover:text-primary transition-colors font-medium">
                    <UserCog size={18} className="mr-1.5"/>
                    Gerenciar
                  </Link>
                </li>
                <li>
                  <Button onClick={logout} variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10 px-3 py-1.5 h-auto">
                    <LogOut size={18} className="mr-1.5" />
                    Sair
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="flex items-center text-foreground hover:text-primary transition-colors font-medium">
                   <LogIn size={18} className="mr-1.5"/>
                  Acesso Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
