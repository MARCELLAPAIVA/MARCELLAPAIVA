
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function ProductGallery() {
  const { products, isHydrated, selectedCategory } = useProducts();

  // Estado de carregamento inicial ou enquanto os dados não foram hidratados no cliente
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

  // Filtra os produtos com base na categoria selecionada
  // Se selectedCategory for null, filteredProducts será igual a products (todos os produtos)
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Se não houver produtos após a filtragem (ou se não houver produtos de todo)
  if (filteredProducts.length === 0) {
    // Se uma categoria específica foi selecionada e não há produtos nela,
    // o usuário quer que "nada apareça".
    if (selectedCategory) {
      return null; // Não renderiza nada para esta condição, galeria fica vazia
    }
    // Se "Todas as Categorias" está selecionada (selectedCategory é null)
    // e não há nenhum produto cadastrado no sistema.
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

  // Se houver produtos para exibir (filtrados ou todos)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
