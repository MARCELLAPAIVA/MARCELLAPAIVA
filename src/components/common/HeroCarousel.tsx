
"use client";

import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { storage, ref } from '@/lib/firebase';
import { getDownloadURL } from 'firebase/storage';
import type { Product } from '@/lib/types';

export default function HeroCarousel() {
  const { rawProducts, isLoading } = useProducts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<string>("Banner rotativo de produtos em destaque");

  useEffect(() => {
    let isMounted = true;
    
    // Only proceed if products are loaded and there's at least one product
    if (!isLoading && rawProducts && rawProducts.length > 0) {
      // Find the first product that has a storagePath
      const firstProductWithImage = rawProducts.find(p => p.storagePath);
      
      if (firstProductWithImage) {
        // Asynchronously get the download URL from the storage path
        const imageRef = ref(storage, firstProductWithImage.storagePath);
        getDownloadURL(imageRef)
          .then(url => {
            if (isMounted) {
              setSelectedImage(url);
              setSelectedAlt(firstProductWithImage.description ? `Imagem de ${firstProductWithImage.description.substring(0, 50)}` : "Imagem de produto em destaque");
            }
          })
          .catch(error => {
            console.error("HeroCarousel: Failed to get download URL", error);
            if (isMounted) {
              setSelectedImage("https://placehold.co/1200x420.png"); // Fallback on error
              setSelectedAlt("Erro ao carregar imagem do produto");
            }
          });
      } else {
        // Fallback if no products have a storagePath
        setSelectedImage("https://placehold.co/1200x420.png");
        setSelectedAlt("Banner de produto em destaque");
      }
    } else if (!isLoading) {
      // Fallback if there are no products
      setSelectedImage("https://placehold.co/1200x420.png");
      setSelectedAlt("Adicione produtos para exibir no carrossel");
    }

    return () => {
      isMounted = false;
    };
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
  
  return (
    <section aria-label="Destaques da Loja">
      <Card className="overflow-hidden shadow-lg border-none">
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted">
           <img
            key={selectedImage}
            src={selectedImage}
            alt={selectedAlt}
            crossOrigin="anonymous"
            loading="eager"
            className="object-cover w-full h-full"
            data-ai-hint="store banner promotion product"
            onError={(e) => {
                console.error(`HeroCarousel: FAILED to load image. URL: ${selectedImage}`);
                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x420.png';
            }}
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
