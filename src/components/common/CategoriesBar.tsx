
"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; 
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link"; // Assuming categories might link somewhere in the future

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
  "PRODUTOS", // Consider if this generic category is needed or should be more specific
  "PRODUTOS COM TEPERNO", // Assuming "TEPERNO" is a specific attribute or brand
  "ROSH",
  "STEM",
  "VASOS",
];

export default function CategoriesBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card p-2 border-t border-border md:hidden z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-card-foreground hover:bg-muted/80">
            <Menu size={20} />
            <span className="text-sm font-medium">Categorias</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh] flex flex-col bg-card border-border">
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
                  {/* For now, these are just text. They can be <Link> or <Button> later for filtering. */}
                  <button 
                    onClick={() => {
                        // Placeholder for category selection logic
                        // For now, it could close the sheet or navigate (if linking)
                        // console.log(`Category selected: ${category}`);
                        // Example: Close sheet after selection by finding the close button if not using SheetClose directly
                      }}
                    className="w-full text-left py-3 px-2 text-foreground hover:bg-muted/50 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
