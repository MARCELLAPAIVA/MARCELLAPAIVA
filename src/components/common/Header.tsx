
"use client";

import Link from 'next/link';
import { Search, Menu, X, ShieldCheck, ListFilter, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { categories } from '@/lib/categories';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Header() {
  const { getTotalItems, isCartVisibleToUser } = useCart();
  const { user } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const currentSearchTerm = searchParams.get('search');
  
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(!!currentSearchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState(currentSearchTerm || "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const totalCartItems = getTotalItems();

  const handleSearchIconClick = () => {
    setIsSearchInputVisible(true);
  };

  const createQueryString = (paramsToUpdate: { [key: string]: string | null }): string => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    return current.toString();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const queryString = createQueryString({ 'search': localSearchTerm || null });
    router.push(pathname + (queryString ? `?${queryString}` : ''));
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    const queryString = createQueryString({ 'search': null });
    router.push(pathname + (queryString ? `?${queryString}` : ''));
    setIsSearchInputVisible(false);
  };

  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {!isSearchInputVisible ? (
          <>
            <div className="flex items-center space-x-3">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                  <ScrollArea className="flex-grow">
                    <ul className="space-y-1 p-4">
                      <li>
                        <Link
                          href={pathname}
                          onClick={() => setIsSheetOpen(false)}
                          className={`w-full text-left py-3 px-3 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary font-body flex items-center text-foreground hover:bg-muted/50 ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                        >
                          <ListFilter size={18} className="mr-2 opacity-70" />
                          Todas as Categorias
                        </Link>
                      </li>
                      {categories.map((category) => (
                        <li key={category}>
                           <Link
                            href={`${pathname}?${createQueryString({ category: category })}`}
                            onClick={() => setIsSheetOpen(false)}
                            className={`w-full text-left py-3 px-3 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary font-body text-foreground hover:bg-muted/50 ${selectedCategory === category ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                          >
                            {category}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                  <Separator className="my-2 bg-border" />
                  <div className="p-4 border-t border-border">
                    <Link
                      href="/login"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center w-full text-left py-3 px-3 text-foreground hover:bg-muted/50 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary font-body"
                    >
                      <ShieldCheck size={18} className="mr-2 text-primary" />
                      Acesso Admin / Conta
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-baseline gap-1.5 text-white hover:text-gray-300 transition-colors">
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm sm:text-base font-medium font-headline text-gray-300">M&T</span>
                  <span className="text-xl sm:text-2xl font-bold font-headline text-primary -mt-0.5">TABACARIA</span>
                </div>
              </Link>
            </div>

            <nav className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white hover:bg-gray-200 text-black rounded-full h-8 w-8 sm:h-9 sm:w-9"
                onClick={handleSearchIconClick}
              >
                <Search size={18} />
                <span className="sr-only">Buscar</span>
              </Button>
              {isCartVisibleToUser && (
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-gray-700 relative h-8 w-8 sm:h-9 sm:w-9">
                  <Link href="/cart">
                    <ShoppingCartIcon size={20} />
                    {totalCartItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {totalCartItems}
                      </span>
                    )}
                    <span className="sr-only">Ver Orçamento</span>
                  </Link>
                </Button>
              )}
            </nav>
          </>
        ) : (
          <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center space-x-2">
            <Input
              type="search"
              placeholder="Buscar produtos ou categorias..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="h-9 bg-gray-700 text-white border-gray-600 focus:ring-primary placeholder-gray-400 flex-grow rounded-full px-4"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700 h-9 w-9 rounded-full"
              onClick={handleClearSearch}
            >
              <X size={20} />
              <span className="sr-only">Limpar busca</span>
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
