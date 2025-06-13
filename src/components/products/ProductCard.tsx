"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group bg-card border-border hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0 relative aspect-square overflow-hidden">
        <Image
          src={product.imageBase64 || "https://placehold.co/400x400.png"}
          alt={product.description.substring(0, 30) || "Imagem do Produto"}
          width={400}
          height={400}
          className="object-cover w-full h-full group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 ease-in-out"
          data-ai-hint="product tobacco"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
      </CardHeader>
      <CardContent className="p-4">
        {/* CardTitle could be used if products had names, for now, focusing on description */}
        {/* <CardTitle className="font-headline text-lg text-primary mb-2 truncate">{product.name || "Produto"}</CardTitle> */}
        <CardDescription className="font-body text-foreground line-clamp-3 h-16">
          {product.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
