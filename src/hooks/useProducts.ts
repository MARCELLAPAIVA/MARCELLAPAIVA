"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';

const PRODUCTS_STORAGE_KEY = 'mtTabacariaProducts';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error("Failed to load products from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } catch (error) {
        console.error("Failed to save products to localStorage:", error);
      }
    }
  }, [products, isHydrated]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt'>) => {
    setProducts((prevProducts) => [
      { ...productData, id: crypto.randomUUID(), createdAt: Date.now() },
      ...prevProducts,
    ]);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
  }, []);

  const sortedProducts = products.sort((a, b) => b.createdAt - a.createdAt);

  return { products: sortedProducts, addProduct, removeProduct, isHydrated };
}
