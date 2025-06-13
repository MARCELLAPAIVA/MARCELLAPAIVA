
"use client";

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  "BBQ",
  "BORRACHAS DE VEDAÇÃO",
  "CARVÃO",
  "ESSENCIA",
  "FOGAREIRO",
  "HEAD SHOP",
  "JOGOS E DIVERSOS",
  "KIT NARGUILE",
  "MANGUEIRAS",
  "PAPEL ALUMINIO",
  "PRATOS",
  "PRODUTOS",
  "PRODUTOS COM TEPERNO",
  "ROSH",
  "STEM",
  "VASOS",
];

export default function Header() {
  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 h-8 w-8 sm:h-9 sm:w-9">
                <Menu size={20} />
                <span className="sr-only">Abrir menu de categorias</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col bg-card border-border">
              <SheetHeader className="p-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <SheetTitle className="text-xl font-headline text-primary">Categorias</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <X size={24} />
                      <span className="sr-only">Fechar</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-grow p-4">
                <ul className="space-y-3">
                  {categories.map((category) => (
                    <li key={category}>
                      <SheetClose asChild>
                        <button
                          // onClick={() => { /* Placeholder for category selection logic */ }}
                          className="w-full text-left py-3 px-2 text-foreground hover:bg-muted/50 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {category}
                        </button>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-baseline gap-1.5 text-white hover:text-gray-300 transition-colors">
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm sm:text-base font-medium font-headline text-gray-300">M&T</span>
              <span className="text-xl sm:text-2xl font-bold font-headline text-primary -mt-0.5">TABACARIA</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/login" className="text-sm sm:text-base hover:text-gray-300 transition-colors">
            Acesso Admin
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
