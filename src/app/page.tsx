
"use client";

import HeroCarousel from '@/components/common/HeroCarousel';
import WelcomeAuthSection from '@/components/common/WelcomeAuthSection';
import CategoryFilterDropdown from '@/components/common/CategoryFilterDropdown';
import ProductGallery from '@/components/products/ProductGallery';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    console.log("HomePage: Normal component mounted. This should display the product gallery.");
  }, []);

  console.log("HomePage: Normal function body executing.");

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
        <ProductGallery />
      </div>
    </div>
  );
}
