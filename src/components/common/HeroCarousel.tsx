"use client";

import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HeroCarousel() {
  const { rawProducts: products, isLoading } = useProducts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<string>("Banner rotativo de produtos em destaque");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isLoading && products && products.length > 0) {
      const firstProductWithImage = products.find(p => p.imageUrl);
      if (firstProductWithImage) {
        setSelectedImage(firstProductWithImage.imageUrl);
        setSelectedAlt(firstProductWithImage.description ? `Imagem de ${firstProductWithImage.description.substring(0, 50)}` : "Imagem de produto em destaque");
        setImageError(false);
      } else {
        setSelectedImage("https://placehold.co/1200x420.png");
        setSelectedAlt("Banner de produto em destaque");
      }
    } else if (!isLoading && products && products.length === 0) {
      setSelectedImage("https://placehold.co/1200x420.png");
      setSelectedAlt("Adicione produtos para exibir no carrossel");
    }
  }, [products, isLoading]);
  
  const handleImageError = () => {
    console.warn(`HeroCarousel: Standard <img> error for URL: ${selectedImage}. Switching to placeholder.`);
    setImageError(true);
  };

  if (isLoading || !selectedImage) {
    return (
      <section aria-label="Destaques da Loja">
        <Card className="overflow-hidden shadow-lg border-none">
          <Skeleton className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted" />
        </Card>
      </section>
    );
  }
  
  const finalImageUrl = imageError ? "https://placehold.co/1200x420.png" : selectedImage;
  const finalAltText = imageError ? "Imagem de fallback" : selectedAlt;

  return (
    <section aria-label="Destaques da Loja">
      <Card className="overflow-hidden shadow-lg border-none">
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted">
          <img
            src={finalImageUrl}
            alt={finalAltText}
            className="object-cover w-full h-full"
            data-ai-hint="store banner promotion product"
            onError={handleImageError}
            loading="lazy"
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
