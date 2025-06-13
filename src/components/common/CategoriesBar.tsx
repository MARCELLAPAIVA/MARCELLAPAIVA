
"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; // Hamburger icon

export default function CategoriesBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card p-2 border-t border-border shadow-up md:hidden z-40">
      <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-card-foreground hover:bg-muted/80">
        <Menu size={20} />
        <span className="text-sm font-medium">Categorias</span>
      </Button>
    </div>
  );
}
