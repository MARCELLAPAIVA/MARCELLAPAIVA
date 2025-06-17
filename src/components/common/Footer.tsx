
"use client";

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-black text-slate-300 border-t border-border/30 mt-auto py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left mb-8">
          
          <div className="lg:col-span-1">
            <h3 className="text-xl font-headline text-primary mb-4">M&T Tabacaria</h3>
            <p className="text-sm font-body text-slate-400 leading-relaxed">
              Especialistas em artigos de tabacaria, narguilés e acessórios de alta qualidade. Encontre tudo o que precisa para sua sessão perfeita.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-headline text-primary mb-4">Links Rápidos</h3>
            <ul className="space-y-3 text-sm font-body">
              <li><Link href="/" className="hover:text-primary transition-colors duration-200">Início</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors duration-200">Nossos Produtos</Link></li> 
              <li><Link href="/login" className="hover:text-primary transition-colors duration-200">Login / Cadastro</Link></li>
              {/* Você pode adicionar mais links aqui, como "Contato" ou "Sobre Nós", se criar essas páginas */}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-headline text-primary mb-4">Aviso Importante</h3>
             <div className="flex items-center justify-center md:justify-start text-sm font-body mb-2">
              <ShieldAlert size={20} className="mr-2 text-amber-400 flex-shrink-0" />
              <span>Produtos destinados a maiores de 18 anos.</span>
            </div>
            <p className="text-xs font-body text-slate-400/80 leading-relaxed">
              A venda de produtos de tabaco é proibida para menores. Nossos produtos são para apreciadores conscientes. Aprecie com responsabilidade.
            </p>
          </div>

        </div>
        <Separator className="bg-border/40 my-8" />
        <div className="text-center text-sm font-body text-slate-400">
          {currentYear ? (
            <p>&copy; {currentYear} M&T Tabacaria. Todos os direitos reservados.</p>
          ) : (
            <p>&copy; M&T Tabacaria. Todos os direitos reservados.</p> 
          )}
          <p className="text-xs mt-2">
            Desenvolvido com <span className="text-primary animate-pulse">&hearts;</span> para os amantes de uma boa sessão.
          </p>
        </div>
      </div>
    </footer>
  );
}
