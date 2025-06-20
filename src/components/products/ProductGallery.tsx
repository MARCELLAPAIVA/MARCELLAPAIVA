
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, SearchX } from 'lucide-react';

export default function ProductGallery() {
  console.error("ProductGallery: Component rendering/re-rendering.");
  const { products: displayedProducts, isHydrated, isLoading, rawProducts, selectedCategory, searchTerm } = useProducts();

  console.error("ProductGallery: State from useProducts - isLoading:", isLoading, "isHydrated:", isHydrated);
  console.error("ProductGallery: State from useProducts - rawProducts count:", rawProducts.length);
  console.error("ProductGallery: State from useProducts - displayedProducts count:", displayedProducts.length, "Content sample (first 2):", JSON.stringify(displayedProducts.slice(0,2).map(p => ({id: p.id, desc:p.description?.substring(0,15), imageUrl: p.imageUrl?.substring(0,40) + "..."}))));
  console.error("ProductGallery: State from useProducts - selectedCategory:", selectedCategory, "searchTerm:", searchTerm);


  if (!isHydrated || isLoading) {
    console.error("ProductGallery: Showing SKELETON loading state. !isHydrated:", !isHydrated, "isLoading:", isLoading);
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
      console.error("ProductGallery: No products found for search term:", searchTerm);
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
    if (selectedCategory && rawProducts.length > 0) {
      console.error("ProductGallery: No products in selected category:", selectedCategory, "but rawProducts exist:", rawProducts.length);
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
          <AlertTriangle size={48} className="text-primary mb-4" />
          <h2 className="text-2xl font-headline text-foreground mb-2">
            Categoria Vazia
          </h2>
          <p className="text-muted-foreground font-body">
            Não há produtos cadastrados nesta categoria ({selectedCategory}).
          </p>
        </div>
      );
    }

    if (rawProducts.length === 0 && !isLoading) {
      console.error("ProductGallery: No products registered AT ALL and not loading.");
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

    console.error("ProductGallery: displayedProducts is empty, but conditions for specific 'no products' messages not met. rawProducts count:", rawProducts.length, "isLoading:", isLoading);
    return (
         <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
          <AlertTriangle size={48} className="text-primary mb-4" />
          <h2 className="text-2xl font-headline text-foreground mb-2">
            Verificando Produtos...
          </h2>
          <p className="text-muted-foreground font-body">
            Aguarde um momento. Se esta mensagem persistir, pode haver um problema ao carregar os produtos.
          </p>
        </div>
    );
  }

  console.error(`ProductGallery: About to MAP ${displayedProducts.length} product cards.`);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayedProducts.map((product, index) => {
        if (!product || typeof product.id !== 'string') {
          console.error(`ProductGallery: CRITICAL - Invalid product object or missing/invalid ID at index ${index} during map:`, product);
          return (
            <div key={`error-${index}-${Math.random()}`} className="p-2 border border-destructive bg-destructive/10 text-destructive-foreground text-xs">
              Erro: Produto inválido no índice {index}. Verifique o console.
            </div>
          );
        }
        console.error(`ProductGallery: Mapping product to ProductCard. ID: ${product.id}, Index: ${index}, Product imageUrl: ${product.imageUrl?.substring(0,30)}`);
        return <ProductCard key={product.id} product={product} />;
      })}
    </div>
  );
}
