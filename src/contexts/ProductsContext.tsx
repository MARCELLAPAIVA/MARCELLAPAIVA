
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import {
  addProductToFirebase,
  getProductsFromFirebase,
  deleteProductFromFirebase
} from '@/lib/productService';
import { useToast } from "@/hooks/use-toast";

// Define the shape of the context state
interface ProductsContextType {
  rawProducts: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'storagePath' | 'imageName'>, imageFile: File) => Promise<void>;
  removeProduct: (id: string, storagePath: string, productName?: string) => Promise<void>;
  isLoading: boolean;
  isMutating: boolean;
  isHydrated: boolean;
  refetchProducts: () => Promise<void>;
}

// Create the context
export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Create the Provider component
export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      if (Array.isArray(firebaseProducts)) {
        setRawProducts(firebaseProducts);
      } else {
        console.error("ProductsProvider: getProductsFromFirebase did not return an array. Received:", firebaseProducts);
        setRawProducts([]);
      }
    } catch (error) {
      console.error("ProductsProvider: FAILED to load products from Firebase:", error);
      toast({
        title: "Erro ao Carregar Produtos",
        description: "Não foi possível buscar os produtos do servidor.",
        variant: "destructive",
      });
      setRawProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    productData: Omit<Product, 'id' | 'createdAt' | 'storagePath' | 'imageName'>,
    imageFile: File
  ) => {
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
      console.error("ProductsProvider: FAILED to add product:", error);
      toast({
        title: "Erro ao Adicionar Produto",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchProducts]);

  const removeProduct = useCallback(async (id: string, storagePath: string, productName?: string) => {
    setIsMutating(true);
    try {
      await deleteProductFromFirebase(id, storagePath);
      setRawProducts((prevProducts) => prevProducts.filter((p) => p.id !== id)); 
      toast({
        title: "Produto Removido",
        description: `O produto "${productName || 'selecionado'}" foi removido com sucesso.`,
        variant: "default",
      });
    } catch (error) {
      console.error("ProductsProvider: FAILED to remove product:", error);
      toast({
        title: "Erro ao Remover Produto",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast]);

  const isHydrated = !isLoading;

  const value = {
    rawProducts,
    addProduct,
    removeProduct,
    isLoading,
    isMutating,
    isHydrated,
    refetchProducts: fetchProducts,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
