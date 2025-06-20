
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/types';
import {
  addProductToFirebase,
  getProductsFromFirebase,
  deleteProductFromFirebase
} from '@/lib/productService';
import { useToast } from "@/hooks/use-toast";

export function useProducts() {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/delete operations
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    console.log("useProducts: fetchProducts called.");
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      console.log("useProducts: fetchProducts - firebaseProducts received:", firebaseProducts);
      setRawProducts(firebaseProducts);
    } catch (error) {
      console.error("useProducts: Failed to load products from Firebase:", error);
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os produtos do servidor. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setRawProducts([]);
    } finally {
      setIsLoading(false);
      console.log("useProducts: fetchProducts finished. isLoading set to false.");
    }
  }, [toast]);

  useEffect(() => {
    console.log("useProducts: useEffect to fetchProducts triggered.");
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl'>,
    imageFile: File
  ) => {
    setIsMutating(true);
    try {
      await addProductToFirebase(productData, imageFile);
      await fetchProducts(); // Refetch products to update the list
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
      setRawProducts((prevProducts) => prevProducts.filter((p) => p.id !== id)); // Update rawProducts
      toast({
        title: "Produto Removido",
        description: `O produto "${productName || 'selecionado'}" foi removido com sucesso.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
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

  const products = useMemo(() => {
    console.log("useProducts: useMemo for 'products' recalculating. rawProducts count:", rawProducts.length, "selectedCategory:", selectedCategory, "searchTerm:", searchTerm);
    let tempProducts = [...rawProducts];

    if (selectedCategory) {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(product => {
        const descriptionMatch = product.description && typeof product.description === 'string' && product.description.toLowerCase().includes(lowercasedSearchTerm);
        const categoryMatch = product.category && typeof product.category === 'string' && product.category.toLowerCase().includes(lowercasedSearchTerm);
        return descriptionMatch || categoryMatch;
      });
    }
    console.log("useProducts: useMemo for 'products' done. tempProducts count:", tempProducts.length);
    return tempProducts;
  }, [rawProducts, selectedCategory, searchTerm]);

  const isHydrated = !isLoading;
  console.log("useProducts: hook returning. isHydrated:", isHydrated, "isLoading:", isLoading, "products count:", products.length);


  return {
    products, // Filtered/searched products
    rawProducts, // All products without filters/search
    addProduct,
    removeProduct,
    isLoading,
    isMutating,
    isHydrated,
    refetchProducts: fetchProducts,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
  };
}
