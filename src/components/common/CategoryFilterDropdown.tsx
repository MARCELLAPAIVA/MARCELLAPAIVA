
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/categories";
import { Filter } from "lucide-react";

const ALL_CATEGORIES_VALUE = "all";

export default function CategoryFilterDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL_CATEGORIES_VALUE) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleValueChange = (value: string) => {
    const queryString = createQueryString('category', value);
    router.push(pathname + (queryString ? `?${queryString}` : ''));
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
