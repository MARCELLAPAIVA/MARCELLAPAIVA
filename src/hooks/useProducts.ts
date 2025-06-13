
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { 
  addProductToFirebase, 
  getProductsFromFirebase, 
  deleteProductFromFirebase 
} from '@/lib/productService';
import { useToast } from "@/hooks/use-toast";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/delete operations
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      setProducts(firebaseProducts);
    } catch (error) {
      console.error("Failed to load products from Firebase:", error);
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os produtos do servidor. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl'>, 
    imageFile: File
  ) => {
    setIsMutating(true);
    try {
      const newProduct = await addProductToFirebase(productData, imageFile);
      // Optimistic update or refetch:
      // For simplicity, we refetch. For better UX, you could add to local state immediately.
      await fetchProducts(); 
      toast({
        title: "Sucesso!",
        description: `Produto "${productData.description.substring(0,30)}..." adicionado.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Erro ao Adicionar Produto",
        description: "Não foi possível salvar o produto. Verifique sua conexão ou tente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchProducts]);

  const removeProduct = useCallback(async (id: string, imageUrl: string, productName?: string) => {
    setIsMutating(true);
    try {
      await deleteProductFromFirebase(id, imageUrl);
      // Optimistic update or refetch:
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
      toast({
        title: "Produto Removido",
        description: `O produto "${productName || 'selecionado'}" foi removido com sucesso.`,
        variant: "destructive", // Or "default" if preferred
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
      // If optimistic update failed, refetch to sync state
      await fetchProducts();
      toast({
        title: "Erro ao Remover Produto",
        description: "Não foi possível remover o produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchProducts]);
  
  // isHydrated is less relevant now as data comes from Firebase, isLoading is more important
  // Kept for compatibility if any component relies on it, but should ideally be isLoading
  const isHydrated = !isLoading; 

  return { products, addProduct, removeProduct, isLoading, isMutating, isHydrated, refetchProducts: fetchProducts };
}
