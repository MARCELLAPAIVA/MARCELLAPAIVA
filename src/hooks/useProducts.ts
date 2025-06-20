
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
  // Changed to console.log for general hook initialization
  console.log("useProducts: HOOK INITIALIZED OR RE-RUNNING.");
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    // Changed to console.log
    console.log("useProducts: fetchProducts CALLED.");
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      // Changed to console.log
      console.log("useProducts: fetchProducts - firebaseProducts RECEIVED:", JSON.stringify(firebaseProducts.map(p => ({id: p.id, desc: p.description?.substring(0,10), imgUrl: p.imageUrl?.substring(0,30) }))));
      
      if (Array.isArray(firebaseProducts)) {
        const validProducts = firebaseProducts.filter(p => {
          if (!p || !p.id || typeof p.description !== 'string') {
            console.warn("useProducts: fetchProducts - Invalid product object found and filtered out:", p); // Kept warn for invalid data
            return false;
          }
          if (typeof p.imageUrl !== 'string' || !p.imageUrl.startsWith('https://')) {
            console.warn(`useProducts: fetchProducts - Product ID ${p.id} ('${p.description?.substring(0,20)}') has invalid or missing imageUrl:`, p.imageUrl); // Kept warn
          }
          return true;
        });
        setRawProducts(validProducts);
      } else {
        console.error("useProducts: fetchProducts - getProductsFromFirebase did not return an array. Received:", firebaseProducts); // Kept error for unexpected type
        setRawProducts([]);
      }
    } catch (error) {
      console.error("useProducts: fetchProducts - FAILED to load products from Firebase:", error); // Kept error for actual failure
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os produtos do servidor.",
        variant: "destructive",
      });
      setRawProducts([]);
    } finally {
      setIsLoading(false);
      // Changed to console.log
      console.log("useProducts: fetchProducts - FINISHED. isLoading is now FALSE.");
    }
  }, [toast]);

  useEffect(() => {
    // Changed to console.log
    console.log("useProducts: useEffect to call fetchProducts TRIGGERED.");
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
    imageFile: File
  ) => {
    // Changed to console.log
    console.log("useProducts: addProduct CALLED for:", productData.description);
    setIsMutating(true);
    try {
      const newProduct = await addProductToFirebase(productData, imageFile);
      if (newProduct) {
        await fetchProducts(); 
        toast({
          title: "Sucesso!",
          description: `Produto "${productData.description.substring(0,30)}..." adicionado.`,
          variant: "default",
        });
      } else {
        throw new Error("addProductToFirebase returned null or invalid product");
      }
    } catch (error) {
      console.error("useProducts: addProduct - FAILED to add product:", error); // Kept error
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
    // Changed to console.log
    console.log("useProducts: removeProduct CALLED for ID:", id);
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
      console.error("useProducts: removeProduct - FAILED to remove product:", error); // Kept error
      toast({
        title: "Erro ao Remover Produto",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast]);

  const products = useMemo(() => {
    // Changed to console.log for this specific debug message
    console.log("useProducts: useMemo for 'products' (filtered list) recalculating. rawProducts count:", rawProducts.length, "selectedCategory:", selectedCategory, "searchTerm:", searchTerm);
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
    // Changed to console.log
    console.log("useProducts: useMemo for 'products' done. Filtered products count:", tempProducts.length);
    return tempProducts;
  }, [rawProducts, selectedCategory, searchTerm]);

  const isHydrated = !isLoading;
  // Changed to console.log
  console.log("useProducts: hook returning. Values - isLoading:", isLoading, "isHydrated:", isHydrated, "filtered products count:", products.length, "rawProducts count:", rawProducts.length);

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
