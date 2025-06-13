
"use client";

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-baseline gap-1 text-white hover:text-gray-300 transition-colors">
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight">
            DISTRIBUIDORA <span className="text-3xl sm:text-4xl font-black">2RJ</span>
          </h1>
        </Link>
        <nav className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/login" className="text-sm sm:text-base hover:text-gray-300 transition-colors">
            Entrar
          </Link>
          <Button variant="ghost" size="icon" className="bg-white hover:bg-gray-200 text-black rounded-full h-8 w-8 sm:h-9 sm:w-9">
            <Search size={18} />
            <span className="sr-only">Buscar</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
