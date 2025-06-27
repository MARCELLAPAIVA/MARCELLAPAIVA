
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import HeroCarousel from '@/components/common/HeroCarousel';
import WelcomeAuthSection from '@/components/common/WelcomeAuthSection';
import CategoryFilterDropdown from '@/components/common/CategoryFilterDropdown';
import ProductGallery from '@/components/products/ProductGallery';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

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
        <ProductGallery
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}

// Loading Skeleton for the main content area
function HomePageSkeleton() {
    return (
        <div className="space-y-8 sm:space-y-12">
            <Skeleton className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-muted" />
            <div className="py-6 sm:py-8 text-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-muted h-12 w-12"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                </div>
            </div>
            <Separator className="my-6 sm:my-8 bg-border/30" />
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Skeleton className="h-9 w-48 bg-muted" />
                <Skeleton className="h-11 w-48 bg-muted rounded-full" />
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg bg-muted/50" />
                    <div className="space-y-1">
                    <Skeleton className="h-4 w-4/5 mx-auto bg-muted/50" />
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}


export default function HomePage() {
  // Suspense is required when a component uses useSearchParams
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}
