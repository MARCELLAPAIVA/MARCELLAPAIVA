
"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; // Hamburger icon

export default function CategoriesBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 p-2 border-t border-border shadow-up md:hidden z-40">
      <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700">
        <Menu size={20} />
        <span className="text-sm font-medium">Categorias</span>
      </Button>
    </div>
  );
}
