
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle2 } from 'lucide-react'; // Placeholder for user icon

export default function WelcomeAuthSection() {
  return (
    <section className="py-6 sm:py-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <UserCircle2 size={48} className="text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Olá!</h2>
          <p className="text-muted-foreground">Entre para visualizar os preços</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="outline" className="w-full text-foreground border-foreground/50 hover:bg-muted text-base py-3 rounded-full">
            Solicitar acesso
          </Button>
        </div>
      </div>
    </section>
  );
}
