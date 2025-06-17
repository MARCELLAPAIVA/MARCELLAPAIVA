
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, CartItem, CartContextType } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useToast } from "@/hooks/use-toast";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const isCartVisibleToUser = !!user && user.status === 'approved';

  // Load cart from localStorage on initial render if user is approved
  useEffect(() => {
    if (isCartVisibleToUser && typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(`cart-${user.uid}`);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } else if (typeof window !== 'undefined') {
      // Clear cart if user is not visible (logged out, pending, etc.)
      // and remove their specific cart from localStorage
      setCartItems([]);
      if (user?.uid) { // If there was a user, clear their specific cart
          localStorage.removeItem(`cart-${user.uid}`);
      } else { // If no user at all, clear any generic cart (less likely to be an issue)
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('cart-')) {
                  keysToRemove.push(key);
              }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    }
  }, [isCartVisibleToUser, user?.uid]);

  // Save cart to localStorage whenever it changes and user is approved
  useEffect(() => {
    if (isCartVisibleToUser && typeof window !== 'undefined' && user?.uid) {
      localStorage.setItem(`cart-${user.uid}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isCartVisibleToUser, user?.uid]);


  const addToCart = useCallback((product: Product) => {
    if (!isCartVisibleToUser) {
      toast({ title: "Acesso Negado", description: "Faça login com uma conta aprovada para adicionar itens ao orçamento.", variant: "destructive" });
      return;
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        toast({ title: "Item Atualizado", description: `${product.description.substring(0,20)}... quantidade aumentada.`, variant: "default" });
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast({ title: "Item Adicionado", description: `${product.description.substring(0,20)}... adicionado ao orçamento.`, variant: "default" });
      return [...prevItems, { product, quantity: 1 }];
    });
  }, [isCartVisibleToUser, toast]);

  const removeFromCart = useCallback((productId: string) => {
    if (!isCartVisibleToUser) return;
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
         toast({ title: "Item Removido", description: `${itemToRemove.product.description.substring(0,20)}... removido do orçamento.`, variant: "default" });
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  }, [isCartVisibleToUser, toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!isCartVisibleToUser) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [isCartVisibleToUser, removeFromCart]);

  const clearCart = useCallback(() => {
    if (!isCartVisibleToUser) return;
    setCartItems([]);
    if (user?.uid && typeof window !== 'undefined') {
        localStorage.removeItem(`cart-${user.uid}`);
    }
    toast({ title: "Orçamento Limpo", description: "Todos os itens foram removidos do seu orçamento.", variant: "default" });
  }, [isCartVisibleToUser, toast, user?.uid]);

  const getTotalItems = useCallback(() => {
    if (!isCartVisibleToUser) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems, isCartVisibleToUser]);

  const generateWhatsAppMessage = useCallback(() => {
    if (!isCartVisibleToUser || cartItems.length === 0) return "";

    let message = "Olá, gostaria de solicitar um orçamento para os seguintes itens:\n";
    cartItems.forEach(item => {
      const priceString = typeof item.product.price === 'number'
        ? ` (R$ ${item.product.price.toFixed(2)})`
        : '';
      message += `- ${item.product.description}${priceString} - Quantidade: ${item.quantity}\n`;
    });
    message += `\nTotal de ${cartItems.reduce((acc,item) => acc + item.quantity, 0)} unidade(s) em ${cartItems.length} produto(s) diferente(s).`;
    message += "\n\nAguardo o contato!";
    return encodeURIComponent(message);
  }, [cartItems, isCartVisibleToUser]);


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, generateWhatsAppMessage, isCartVisibleToUser }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
