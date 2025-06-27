"use client";

import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function HeroCarousel() {
  const { rawProducts, isLoading } = useProducts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<string>("Banner rotativo de produtos em destaque");
  const [useImgFallback, setUseImgFallback] = useState(false);

  useEffect(() => {
    if (!isLoading && rawProducts && rawProducts.length > 0) {
      const firstProductWithImage = rawProducts.find(p => p.imageUrl);
      if (firstProductWithImage) {
        setSelectedImage(firstProductWithImage.imageUrl);
        setSelectedAlt(firstProductWithImage.description ? `Imagem de ${firstProductWithImage.description.substring(0, 50)}` : "Imagem de produto em destaque");
        setUseImgFallback(false);
      } else {
        setSelectedImage("https://placehold.co/1200x420.png");
        setSelectedAlt("Banner de produto em destaque");
      }
    } else if (!isLoading && (!rawProducts || rawProducts.length === 0)) {
      setSelectedImage("https://placehold.co/1200x420.png");
      setSelectedAlt("Adicione produtos para exibir no carrossel");
    }
  }, [rawProducts, isLoading]);

  if (isLoading || !selectedImage) {
    return (
      <section aria-label="Destaques da Loja">
        <Card className="overflow-hidden shadow-lg border-none">
          <Skeleton className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted" />
        </Card>
      </section>
    );
  }
  
  const renderImage = () => {
    if (useImgFallback) {
        return (
            <img
                src={selectedImage}
                alt={selectedAlt}
                className="object-cover w-full h-full"
                data-ai-hint="store banner promotion product"
                // Hero image should load eagerly
                loading="eager" 
                onError={() => console.error(`HeroCarousel: Standard <img> also failed for ${selectedImage}`)}
            />
        );
    }
    return (
        <Image
            src={selectedImage}
            alt={selectedAlt}
            fill
            className="object-cover"
            // Eager loading for LCP
            priority 
            sizes="100vw"
            data-ai-hint="store banner promotion product"
            onError={() => {
                console.warn(`HeroCarousel: next/image failed for ${selectedImage}. Trying <img> fallback.`);
                setUseImgFallback(true);
            }}
        />
    );
  };

  return (
    <section aria-label="Destaques da Loja">
      <Card className="overflow-hidden shadow-lg border-none">
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted">
          {renderImage()}
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
