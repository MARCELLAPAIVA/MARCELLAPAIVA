
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function ProductGallery() {
  const { products, isHydrated } = useProducts();

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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md">
        <AlertTriangle size={48} className="text-primary mb-4" /> {/* Primary is dark gray */}
        <h2 className="text-2xl font-headline text-foreground mb-2">Nenhum Produto Cadastrado</h2> {/* Foreground is near black */}
        <p className="text-muted-foreground font-body">
          Ainda não há produtos para exibir. Adicione novos produtos na página de gerenciamento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
