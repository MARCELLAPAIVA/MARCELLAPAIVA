
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/categories";
import { useProducts } from "@/hooks/useProducts";
import { Filter } from "lucide-react";

const ALL_CATEGORIES_VALUE = "all";

export default function CategoryFilterDropdown() {
  const { setSelectedCategory, selectedCategory } = useProducts();

  const handleValueChange = (value: string) => {
    if (value === ALL_CATEGORIES_VALUE) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(value);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      <Select
        onValueChange={handleValueChange}
        value={selectedCategory || ALL_CATEGORIES_VALUE}
      >
        <SelectTrigger className="w-full sm:w-[200px] rounded-full border-border focus:ring-primary h-11">
          <Filter size={16} className="mr-2 opacity-70" />
          <SelectValue placeholder="Filtrar por categoria..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES_VALUE}>Todas as Categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
