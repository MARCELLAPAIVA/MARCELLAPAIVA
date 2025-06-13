
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export default function SortDropdown() {
  return (
    <div className="w-full sm:w-auto">
      <Select defaultValue="name-asc">
        <SelectTrigger className="w-full sm:w-[180px] rounded-full border-border focus:ring-primary h-11">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Nome A-Z</SelectItem>
          <SelectItem value="name-desc">Nome Z-A</SelectItem>
          <SelectItem value="price-asc">Preço: Menor para Maior</SelectItem>
          <SelectItem value="price-desc">Preço: Maior para Menor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
