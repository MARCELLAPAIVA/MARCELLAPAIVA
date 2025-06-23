"use client";

import HeroCarousel from '@/components/common/HeroCarousel';
import WelcomeAuthSection from '@/components/common/WelcomeAuthSection';
import CategoryFilterDropdown from '@/components/common/CategoryFilterDropdown';
import ProductGallery from '@/components/products/ProductGallery';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/hooks/useProducts'; // Import the hook
import { useEffect } from 'react';

export default function HomePage() {
  // Get the state that should trigger a re-render of the gallery
  const { selectedCategory, searchTerm } = useProducts();

  // Create a unique key based on the current filters.
  // When this key changes, React will unmount the old ProductGallery and mount a new one.
  const galleryKey = `gallery-${selectedCategory || 'all'}-${searchTerm || 'none'}`;

  useEffect(() => {
    // This log helps in debugging to see if HomePage is re-evaluating when filters change.
    console.log(`HomePage: Rendering with new galleryKey: ${galleryKey}`);
  }, [galleryKey]);


  return (
    <div className="space-y-8 sm:space-y-12">
      <HeroCarousel />
      <WelcomeAuthSection />
      
      <Separator className="my-6 sm:my-8 bg-border/30" />

      <div>
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-headline text-foreground text-center sm:text-left">
            Nossos Produtos
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <CategoryFilterDropdown />
          </div>
        </div>
        {/* Pass the unique key to the ProductGallery component to force remount on change */}
        <ProductGallery key={galleryKey} />
      </div>
    </div>
  );
}
