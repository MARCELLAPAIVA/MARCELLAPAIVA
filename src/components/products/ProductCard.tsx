"use client";

import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [useImgFallback, setUseImgFallback] = useState(false);
  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  useEffect(() => {
    // Reset fallback state when the product prop changes
    setUseImgFallback(false);
  }, [product]);

  if (!product || typeof product.id !== 'string') {
    return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p className="font-bold">Erro nos Dados do Produto!</p>
        <p className="text-xs">ID do produto ausente ou inválido.</p>
      </Card>
    );
  }
  
  const safeDescription = product.description || "Descrição Indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && (product.imageUrl.startsWith('https://') || product.imageUrl.startsWith('http://'));
  const altText = (product.imageName || productName || "Imagem do produto").substring(0,100);

  const handleAddToCart = () => {
    addToCart(product);
  };
  
  const finalImageUrl = !isValidImageUrl ? "https://placehold.co/400x400.png" : product.imageUrl;

  const renderImage = () => {
    if (!isValidImageUrl) {
        return <Image src="https://placehold.co/400x400.png" alt="Imagem de placeholder" fill className="object-cover" />;
    }
    
    if (useImgFallback) {
        return (
            <img
                src={finalImageUrl}
                alt={altText}
                className="object-cover w-full h-full"
                loading="lazy"
                onError={() => console.error(`ProductCard: Standard <img> also failed for ${product.id}`)}
            />
        );
    }

    return (
        <Image
            src={finalImageUrl}
            alt={altText}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            data-ai-hint="product tobacco"
            onError={() => {
                console.warn(`ProductCard: next/image failed for ${product.id}. Trying <img> fallback.`);
                setUseImgFallback(true);
            }}
        />
    );
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center p-1 text-center">
        {renderImage()}
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
            disabled={!isValidImageUrl}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
