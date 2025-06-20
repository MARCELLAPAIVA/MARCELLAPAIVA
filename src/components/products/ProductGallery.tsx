
"use client";

import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, SearchX } from 'lucide-react';

export default function ProductGallery() {
  const { products: displayedProducts, isHydrated, selectedCategory, searchTerm, rawProducts } = useProducts();

  console.log("ProductGallery: isHydrated:", isHydrated);
  console.log("ProductGallery: displayedProducts:", displayedProducts);
  console.log("ProductGallery: selectedCategory:", selectedCategory);
  console.log("ProductGallery: searchTerm:", searchTerm);
  console.log("ProductGallery: rawProducts count:", rawProducts.length);


  if (!isHydrated) {
    console.log("ProductGallery: Showing skeleton loading state.");
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
      console.log("ProductGallery: No products found for search term:", searchTerm);
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
    // Não mostrar "Nenhum produto cadastrado" se uma categoria estiver selecionada e não houver produtos nela
    if (selectedCategory && rawProducts.length > 0) {
      console.log("ProductGallery: No products in selected category:", selectedCategory, "but rawProducts exist.");
      // Poderia mostrar uma mensagem específica para categoria vazia, ou null para não mostrar nada
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
    if (rawProducts.length === 0) {
      console.log("ProductGallery: No products registered at all.");
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
    // Se displayedProducts for 0, mas rawProducts > 0 e não houver termo de busca nem categoria,
    // isso seria um estado inesperado. Por segurança, logar e retornar null ou uma mensagem.
    console.log("ProductGallery: displayedProducts is empty, but conditions for specific messages not met. rawProducts count:", rawProducts.length);
    return null; 
  }

  console.log(`ProductGallery: Rendering ${displayedProducts.length} product cards.`);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayedProducts.map((product) => {
        if (!product || !product.id) {
          console.error("ProductGallery: Invalid product object in map:", product);
          return null; // Skip rendering this invalid product
        }
        console.log("ProductGallery: Mapping product to ProductCard, ID:", product.id);
        return <ProductCard key={product.id} product={product} />;
      })}
    </div>
  );
}
