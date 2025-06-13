
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card'; // CardTitle, CardDescription removed

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Use the beginning of the description as a product name placeholder
  const productName = product.description.substring(0, 40) + (product.description.length > 40 ? "..." : "");

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden">
        <Image
          src={product.imageBase64 || "https://placehold.co/400x400.png"}
          alt={productName || "Imagem do Produto"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          data-ai-hint="product tobacco"
        />
      </div>
      <CardContent className="p-3 flex-grow flex flex-col justify-center">
        {/* Simplified product name display */}
        <p className="font-body text-sm text-foreground text-center line-clamp-2">
          {productName}
        </p>
      </CardContent>
    </Card>
  );
}
