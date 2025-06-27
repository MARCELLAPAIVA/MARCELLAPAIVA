
"use client";

import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storage, ref } from '@/lib/firebase';
import { getDownloadURL } from 'firebase/storage';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (product.storagePath) {
      const imageRef = ref(storage, product.storagePath);
      getDownloadURL(imageRef)
        .then((url) => {
          if (isMounted) {
            setImageUrl(url);
          }
        })
        .catch((error) => {
          console.error(`ProductCard: FAILED to get download URL for ${product.storagePath}`, error);
          // Set to a placeholder or leave null to show error state
          setImageUrl("https://placehold.co/400x400.png"); 
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingImage(false);
          }
        });
    } else {
        setIsLoadingImage(false);
        setImageUrl("https://placehold.co/400x400.png");
    }

    return () => {
      isMounted = false;
    };
  }, [product.storagePath]);


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
  const altText = (product.imageName || productName || "Imagem do produto").substring(0,100);

  const handleAddToCart = () => {
    if (imageUrl) {
      // Add the resolved image URL to the product object before adding to cart
      const productWithUrl = { ...product, imageUrl };
      addToCart(productWithUrl);
    } else {
      // You could show a toast here if you want
      console.warn("Add to cart clicked before image URL was resolved.");
    }
  };
  
  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center p-1 text-center">
        {isLoadingImage ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img
            key={product.id}
            src={imageUrl || "https://placehold.co/400x400.png"}
            alt={altText}
            crossOrigin="anonymous"
            loading="lazy"
            className="object-cover w-full h-full"
            data-ai-hint="product tobacco"
            onError={(e) => {
              console.error(`ProductCard: FAILED to render image for product ${product.id}. URL: ${imageUrl}`);
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400.png";
            }}
          />
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
            disabled={isLoadingImage || !imageUrl || !product.storagePath}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
