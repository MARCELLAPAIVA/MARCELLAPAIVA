
"use client";

import Image from 'next/image';
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
  console.error(`ProductCard: Component rendering. Product ID: ${product?.id}`);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    console.warn(`ProductCard (useEffect for product ${product?.id}): Full product object:`, JSON.parse(JSON.stringify(product))); // Stringify/parse to ensure full object is logged
    if (product && product.imageUrl) {
      console.warn(`ProductCard (useEffect for product ${product?.id}): Attempted Image URL: '${product.imageUrl}'`);
    } else {
      console.error(`ProductCard (useEffect for product ${product?.id}): Product or product.imageUrl is MISSING/INVALID.`);
    }
  }, [product]);


  if (!product || typeof product.id !== 'string') {
    console.error("ProductCard: CRITICAL - product prop is null, undefined, or missing/invalid id. Cannot render card. Product was:", product);
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
  
  let safeDescription = "Descrição Indisponível";
  let productName = "Nome Indisponível";

  try {
    safeDescription = product.description || "Descrição padrão se nula";
    productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  } catch (e: any) {
    console.error(`ProductCard: Error accessing product.description for ID ${product?.id}. Error: ${e.message}`, product);
     return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p className="font-bold">Erro ao Acessar Descrição</p>
        <p className="text-xs">ID: {product?.id}</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-black/20 p-1 rounded">{JSON.stringify(product, null, 2)}</pre>
      </Card>
    );
  }

  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://firebasestorage.googleapis.com');
  const altText = (product.imageName || productName || "Imagem do produto").substring(0,100);
  console.warn(`ProductCard: Processing product '${productName}'. Attempted Image URL: '${product.imageUrl}'. Alt text: '${altText}'`);


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
              console.error(`ProductCard: Error loading image for product ${product.id}. URL: ${product.imageUrl}`, e);
              // @ts-ignore
              console.error(`ProductCard: Failing image element src was: ${e.target?.src}`);
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
            {!isValidImageUrl && <p className="text-destructive/70 mt-1">URL da imagem parece inválida.</p>}
            <p className="truncate mt-1" title={product.imageUrl}>Debug URL: {product.imageUrl ? product.imageUrl.substring(0,30) + "..." : "N/A"}</p>
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
            disabled={!isValidImageUrl || imageError}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
