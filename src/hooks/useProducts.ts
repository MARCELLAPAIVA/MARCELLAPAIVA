
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
  console.warn("useProducts: Hook initializing / re-running.");
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    console.warn("useProducts: fetchProducts CALLED.");
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      console.warn("useProducts: fetchProducts - firebaseProducts RECEIVED:", firebaseProducts);
      if (Array.isArray(firebaseProducts)) {
        // Validação básica de cada produto
        const validProducts = firebaseProducts.filter(p => p && p.id && typeof p.description === 'string');
        if (validProducts.length !== firebaseProducts.length) {
          console.error("useProducts: fetchProducts - Some products from Firebase were invalid. Original count:", firebaseProducts.length, "Valid count:", validProducts.length);
        }
        setRawProducts(validProducts);
      } else {
        console.error("useProducts: fetchProducts - getProductsFromFirebase did not return an array. Received:", firebaseProducts);
        setRawProducts([]);
      }
    } catch (error) {
      console.error("useProducts: fetchProducts - FAILED to load products from Firebase:", error);
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os produtos do servidor.",
        variant: "destructive",
      });
      setRawProducts([]);
    } finally {
      setIsLoading(false);
      console.warn("useProducts: fetchProducts - FINISHED. isLoading is now FALSE.");
    }
  }, [toast]);

  useEffect(() => {
    console.warn("useProducts: useEffect to call fetchProducts TRIGGERED.");
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
    imageFile: File
  ) => {
    console.warn("useProducts: addProduct CALLED for:", productData.description);
    setIsMutating(true);
    try {
      await addProductToFirebase(productData, imageFile);
      await fetchProducts(); 
      toast({
        title: "Sucesso!",
        description: `Produto "${productData.description.substring(0,30)}..." adicionado.`,
        variant: "default",
      });
    } catch (error) {
      console.error("useProducts: addProduct - FAILED to add product:", error);
      toast({
        title: "Erro ao Adicionar Produto",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchProducts]);

  const removeProduct = useCallback(async (id: string, imageUrl: string, productName?: string) => {
    console.warn("useProducts: removeProduct CALLED for ID:", id);
    setIsMutating(true);
    try {
      await deleteProductFromFirebase(id, imageUrl);
      setRawProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
      toast({
        title: "Produto Removido",
        description: `O produto "${productName || 'selecionado'}" foi removido com sucesso.`,
        variant: "default",
      });
    } catch (error) {
      console.error("useProducts: removeProduct - FAILED to remove product:", error);
      await fetchProducts();
      toast({
        title: "Erro ao Remover Produto",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchProducts]);

  const products = useMemo(() => {
    console.warn("useProducts: useMemo for 'products' (filtered list) recalculating. rawProducts count:", rawProducts.length, "selectedCategory:", selectedCategory, "searchTerm:", searchTerm);
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
    console.warn("useProducts: useMemo for 'products' done. Filtered products count:", tempProducts.length);
    return tempProducts;
  }, [rawProducts, selectedCategory, searchTerm]);

  const isHydrated = !isLoading; 
  console.warn("useProducts: hook returning. Values - isLoading:", isLoading, "isHydrated:", isHydrated, "filtered products count:", products.length, "rawProducts count:", rawProducts.length);

  return {
    products,
    rawProducts,
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
