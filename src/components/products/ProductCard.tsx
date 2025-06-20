
"use client";

import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Changed from console.error to console.warn to avoid Next.js error overlay
  console.warn(`ProductCard: Function body executing. Product ID: ${product?.id}, Desc: ${product?.description?.substring(0,20)}, ImageURL: ${product?.imageUrl}`);

  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  useEffect(() => {
    // Changed from console.error to console.warn
    console.warn(`ProductCard (useEffect for product ${product?.id}): Full product object:`, JSON.parse(JSON.stringify(product || {})));
    console.warn(`ProductCard (useEffect for product ${product?.id}): Attempted Image URL: '${product?.imageUrl}'`);
    setImageError(false); // Reset image error state if product changes
  }, [product]);

  if (!product || typeof product.id !== 'string') {
    console.error("ProductCard: CRITICAL - product prop is null, undefined, or missing/invalid id. Product was:", JSON.parse(JSON.stringify(product || {})));
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
  // Ensure imageUrl is a string and looks like a Firebase Storage URL before using it.
  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://firebasestorage.googleapis.com');
  const altText = (product.imageName || productName || "Imagem do produto").substring(0,100);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center p-1 text-center">
        {isValidImageUrl && !imageError ? (
          <Image
            src={product.imageUrl} 
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint="product tobacco"
            priority={false} 
            onError={(e) => {
              console.warn(`ProductCard: Error loading image for product ${product.id}. URL: ${product.imageUrl}`, e);
              // @ts-ignore
              console.warn(`ProductCard: Failing image element src was: ${e.target?.src}`);
              setImageError(true);
            }}
          />
        ) : (
          <div className="text-xs text-muted-foreground p-2">
            {imageError ? (
              <p className="text-destructive">Erro ao carregar imagem.</p>
            ) : (
              <p>Imagem indisponível.</p>
            )}
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
            disabled={!isValidImageUrl || imageError} // Disable if URL is invalid or image error occurred
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
