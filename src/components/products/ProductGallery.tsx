
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, SearchX } from 'lucide-react';

export default function ProductGallery() {
  console.log("ProductGallery: Component rendering/re-rendering.");
  const { products: displayedProducts, isHydrated, selectedCategory, searchTerm, rawProducts, isLoading } = useProducts();

  console.log("ProductGallery: State from useProducts - isLoading:", isLoading, "isHydrated:", isHydrated);
  console.log("ProductGallery: State from useProducts - rawProducts count:", rawProducts.length);
  console.log("ProductGallery: State from useProducts - displayedProducts count:", displayedProducts.length);
  console.log("ProductGallery: State from useProducts - selectedCategory:", selectedCategory, "searchTerm:", searchTerm);


  if (!isHydrated && isLoading) { // Condition ensures skeleton shows only during initial load
    console.warn("ProductGallery: Showing SKELETON loading state because !isHydrated and isLoading are true.");
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
      console.warn("ProductGallery: No products found for search term:", searchTerm);
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
      console.warn("ProductGallery: No products in selected category:", selectedCategory, "but rawProducts exist.");
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
    if (rawProducts.length === 0 && !isLoading) { // Only show this if not loading and genuinely no products
      console.warn("ProductGallery: No products registered at all and not loading.");
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
    console.warn("ProductGallery: displayedProducts is empty, but conditions for specific messages not met. rawProducts count:", rawProducts.length, "isLoading:", isLoading);
    // Potentially still loading or an edge case
    if (isLoading) {
        // Fallback to skeleton if it's still loading and somehow bypassed the first check
        console.warn("ProductGallery: Fallback to SKELETON because isLoading is true and displayedProducts is 0.");
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
    return null; 
  }

  console.log(`ProductGallery: Rendering ${displayedProducts.length} product cards.`);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayedProducts.map((product, index) => {
        if (!product || !product.id) {
          console.error(`ProductGallery: Invalid product object at index ${index} in map:`, product);
          return null; 
        }
        console.log(`ProductGallery: Mapping product to ProductCard. ID: ${product.id}, Index: ${index}`);
        return <ProductCard key={product.id} product={product} />;
      })}
    </div>
  );
}
