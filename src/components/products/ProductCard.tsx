
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  const safeDescription = product.description || "Nome do produto indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  const altText = product.imageName || product.description?.substring(0,50) || "Imagem do produto";

  // Log crucial para depuração
  console.log(`ProductCard: Rendering product '${productName}'. Product object:`, product);
  console.log(`ProductCard: Image URL being used for <Image> src: '${product.imageUrl}'`);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint="product tobacco"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`ProductCard: Error loading image for product ${product.id} ('${productName}'). Attempted URL: '${product.imageUrl}'. Current src attribute: '${target.currentSrc}'. Natural width: ${target.naturalWidth}`);
            }}
            onLoad={() => {
              // console.log(`ProductCard: Successfully loaded image for product ${product.id} (${productName}). URL: ${product.imageUrl}`);
            }}
          />
        ) : (
           <Image
            src={"https://placehold.co/400x400.png"} 
            alt={altText} 
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint="product tobacco placeholder"
          />
        )}
      </div>
      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <div>
          <p className="font-body text-sm text-foreground line-clamp-2 mb-1">
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
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
