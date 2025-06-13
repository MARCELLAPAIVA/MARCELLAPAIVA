
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const safeDescription = product.description || "Nome do produto indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  const altText = safeDescription.substring(0,50);

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden">
        <Image
          src={product.imageBase64 || "https://placehold.co/400x400.png"}
          alt={altText}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          data-ai-hint="product tobacco"
        />
      </div>
      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <p className="font-body text-sm text-foreground line-clamp-2 mb-2">
          {productName}
        </p>
        {user ? (
          typeof product.price === 'number' ? (
            <p className="font-headline text-lg text-primary font-semibold">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          ) : (
            <p className="font-headline text-sm text-muted-foreground">Preço não disponível</p>
          )
        ) : (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Preço sob consulta</p>
            <Button variant="link" asChild className="p-0 h-auto text-sm text-primary hover:text-primary/80">
                <Link href="/login">Entrar para ver o preço</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
