
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, SearchX } from 'lucide-react';

export default function ProductGallery() {
  const { products: displayedProducts, isHydrated, selectedCategory, searchTerm, rawProducts } = useProducts();

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg bg-muted/50" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-4/5 mx-auto bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    if (searchTerm && searchTerm.trim() !== '') {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
          <SearchX size={48} className="text-primary mb-4" />
          <h2 className="text-2xl font-headline text-foreground mb-2">
            Nenhum Produto Encontrado
          </h2>
          <p className="text-muted-foreground font-body">
            Não encontramos produtos para "{searchTerm}". Tente um termo diferente.
          </p>
        </div>
      );
    }
    if (selectedCategory) {
      return null;
    }
    if (rawProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
          <AlertTriangle size={48} className="text-primary mb-4" />
          <h2 className="text-2xl font-headline text-foreground mb-2">
            Nenhum Produto Cadastrado
          </h2>
          <p className="text-muted-foreground font-body">
            Adicione novos produtos na página de gerenciamento.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
