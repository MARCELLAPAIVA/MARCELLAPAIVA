
"use client";

import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  useEffect(() => {
    // console.log(`ProductCard (useEffect for product ${product?.id}): Full product object:`, JSON.parse(JSON.stringify(product || {})));
    // console.log(`ProductCard (useEffect for product ${product?.id}): Attempted Image URL: '${product?.imageUrl}'`);
    setImageError(false); // Reset image error state if product changes
  }, [product]);

  if (!product || typeof product.id !== 'string') {
    console.warn("ProductCard: CRITICAL - product prop is null, undefined, or missing/invalid id. Product was:", JSON.parse(JSON.stringify(product || {})));
    return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p className="font-bold">Erro nos Dados do Produto!</p>
        <p className="text-xs">ID do produto ausente ou inválido.</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-black/20 p-1 rounded">
          {product ? JSON.stringify(product, null, 2) : "Produto Nulo/Indefinido"}
        </pre>
      </Card>
    );
  }
  
  const safeDescription = product.description || "Descrição Indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && (product.imageUrl.startsWith('https://firebasestorage.googleapis.com') || product.imageUrl.startsWith('http://localhost')); // Allow localhost for local testing
  const altText = (product.imageName || productName || "Imagem do produto").substring(0,100);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleImageError = () => {
    console.warn(`ProductCard: Standard <img> error for product ${product.id}. URL: ${product.imageUrl}`);
    setImageError(true);
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center p-1 text-center">
        {imageError ? (
          <div className="text-xs text-muted-foreground p-2">
            <p className="text-destructive">Erro ao carregar imagem.</p>
            {!isValidImageUrl && <p className="text-destructive/70 mt-1">URL da imagem parece inválida ou ausente.</p>}
            <p className="truncate mt-1" title={product.imageUrl || "URL não disponível"}>Debug URL: {product.imageUrl ? product.imageUrl.substring(0,30) + "..." : "N/A"}</p>
          </div>
        ) : isValidImageUrl ? (
          <img
            src={product.imageUrl}
            alt={altText}
            className="object-cover w-full h-full"
            onError={handleImageError}
            data-ai-hint="product tobacco"
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-muted-foreground p-2">
            <p>Imagem indisponível.</p>
            {!isValidImageUrl && <p className="text-destructive/70 mt-1">URL da imagem parece inválida ou ausente.</p>}
             <p className="truncate mt-1" title={product.imageUrl || "URL não disponível"}>Debug URL: {product.imageUrl ? product.imageUrl.substring(0,30) + "..." : "N/A"}</p>
          </div>
        )}
      </div>

      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <div>
          <p className="font-body text-sm text-foreground line-clamp-2 mb-1" title={safeDescription}>
            {productName}
          </p>
          {user && user.status === 'approved' ? (
            typeof product.price === 'number' ? (
              <p className="font-headline text-lg text-primary font-semibold">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            ) : (
              <p className="font-headline text-sm text-muted-foreground">Preço não disponível</p>
            )
          ) : (
            <div className="text-center mt-1">
              <p className="text-xs text-muted-foreground mb-1">Preço sob consulta</p>
              <Button variant="link" asChild className="p-0 h-auto text-sm text-primary hover:text-primary/80">
                  <Link href="/login">Entrar para ver o preço</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      {isCartVisibleToUser && (
        <CardFooter className="p-3 border-t border-border/20">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleAddToCart}
            disabled={!isValidImageUrl || imageError} // Disable if no valid image or if it errored
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
