"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/types';
import {
  addProductToFirebase,
  getProductsFromFirebase,
  deleteProductFromFirebase
} from '@/lib/productService';
import { useToast } from "@/hooks/use-toast";

// Define the shape of the context state
interface ProductsContextType {
  products: Product[];
  rawProducts: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>, imageFile: File) => Promise<void>;
  removeProduct: (id: string, imageUrl: string, productName?: string) => Promise<void>;
  isLoading: boolean;
  isMutating: boolean;
  isHydrated: boolean;
  refetchProducts: () => Promise<void>;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchTerm: string | null;
  setSearchTerm: (term: string | null) => void;
}

// Create the context
export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Create the Provider component
export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const firebaseProducts = await getProductsFromFirebase();
      if (Array.isArray(firebaseProducts)) {
        const validProducts = firebaseProducts.filter(p => {
          if (!p || !p.id || typeof p.description !== 'string') {
            console.warn("ProductsProvider: Invalid product object found and filtered out:", p);
            return false;
          }
          if (typeof p.imageUrl !== 'string' || !p.imageUrl.startsWith('https://')) {
             if (typeof p.imageUrl !== 'string' || !p.imageUrl.startsWith('http://localhost')) {
                console.warn(`ProductsProvider: Product ID ${p.id} ('${p.description?.substring(0,20)}') has invalid or missing imageUrl:`, p.imageUrl);
             }
          }
          return true;
        });
        setRawProducts(validProducts);
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
    productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
    imageFile: File
  ) => {
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

  const removeProduct = useCallback(async (id: string, imageUrl: string, productName?: string) => {
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

  const products = useMemo(() => {
    // DIAGNOSTIC LOG
    console.log(`ProductsContext: Filtering products. Category: '${selectedCategory}', Search: '${searchTerm}'`);
    
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
    return tempProducts;
  }, [rawProducts, selectedCategory, searchTerm]);

  const isHydrated = !isLoading;

  const value = {
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

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
