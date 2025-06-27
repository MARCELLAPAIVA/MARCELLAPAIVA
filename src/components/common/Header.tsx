
"use client";

import Link from 'next/link';
import { Search, Menu, X, ShieldCheck, ListFilter, ShoppingCartIcon } from 'lucide-react'; // Adicionado ShoppingCartIcon
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
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext'; // Importar useCart
import { useAuth } from '@/contexts/AuthContext'; // Importar useAuth
import { useState } from 'react';

export default function Header() {
  const { setSearchTerm, setSelectedCategory, selectedCategory } = useProducts();
  const { getTotalItems, isCartVisibleToUser } = useCart();
  const { user } = useAuth(); // Para verificar status do usuário para o carrinho

  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Controlar o estado do menu

  const totalCartItems = getTotalItems();

  const handleSearchIconClick = () => {
    setIsSearchInputVisible(true);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    console.log(`[Header] Search term changed to: ${term}`);
    setLocalSearchTerm(term);
    setSearchTerm(term === "" ? null : term);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    setSearchTerm(null);
    setIsSearchInputVisible(false);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleCategorySelect = (category: string | null) => {
    console.log(`[Header] Category selected from sheet: ${category}`);
    setSelectedCategory(category);
    setIsSheetOpen(false); // Fechar o menu após a seleção
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
                        <button
                          onClick={() => handleCategorySelect(null)}
                          className={`w-full text-left py-3 px-3 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary font-body flex items-center text-foreground hover:bg-muted/50 ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                        >
                          <ListFilter size={18} className="mr-2 opacity-70" />
                          Todas as Categorias
                        </button>
                      </li>
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full text-left py-3 px-3 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary font-body text-foreground hover:bg-muted/50 ${selectedCategory === category ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                          >
                            {category}
                          </button>
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
              onChange={handleSearchInputChange}
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
