
"use client";

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HeroCarousel() {
  const { products, isLoading } = useProducts(); // Using isLoading from Firebase hook
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<string>("Banner rotativo de produtos em destaque");

  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const randomIndex = Math.floor(Math.random() * products.length);
      const randomProduct = products[randomIndex];
      if (randomProduct && randomProduct.imageUrl) {
        setSelectedImage(randomProduct.imageUrl);
        setSelectedAlt(randomProduct.description ? `Imagem de ${randomProduct.description.substring(0,50)}` : "Imagem de produto em destaque");
      } else {
        setSelectedImage("https://placehold.co/1200x420.png");
        setSelectedAlt("Banner de produto em destaque");
      }
    } else if (!isLoading && products.length === 0) {
      setSelectedImage("https://placehold.co/1200x420.png");
      setSelectedAlt("Adicione produtos para exibir no carrossel");
    }
  }, [products, isLoading]);

  if (isLoading || !selectedImage) {
    return (
      <section aria-label="Destaques da Loja">
        <Card className="overflow-hidden shadow-lg border-none">
          <Skeleton className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted" />
        </Card>
      </section>
    );
  }

  return (
    <section aria-label="Destaques da Loja">
      <Card className="overflow-hidden shadow-lg border-none">
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5]">
          <Image
            src={selectedImage}
            alt={selectedAlt}
            fill
            priority
            className="object-cover"
            data-ai-hint="store banner promotion product"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            <span className="block w-2.5 h-2.5 bg-white/70 rounded-full"></span>
            <span className="block w-2.5 h-2.5 bg-white/40 rounded-full"></span>
            <span className="block w-2.5 h-2.5 bg-white/40 rounded-full"></span>
            <span className="block w-2.5 h-2.5 bg-white/40 rounded-full"></span>
          </div>
        </div>
      </Card>
    </section>
  );
}
