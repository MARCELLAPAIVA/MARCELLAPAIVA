import ProductGallery from '@/components/products/ProductGallery';
import HeroCarousel from '@/components/common/HeroCarousel';
import WelcomeAuthSection from '@/components/common/WelcomeAuthSection';
import SortDropdown from '@/components/common/SortDropdown';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroCarousel />
      <WelcomeAuthSection />

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-headline font-bold text-foreground">
            Todos os produtos
          </h2>
          <SortDropdown />
        </div>
        <ProductGallery />
      </section>
    </div>
  );
}
