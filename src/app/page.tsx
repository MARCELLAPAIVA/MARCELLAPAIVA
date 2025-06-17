
import ProductGallery from '@/components/products/ProductGallery';
import HeroCarousel from '@/components/common/HeroCarousel';
import WelcomeAuthSection from '@/components/common/WelcomeAuthSection';
import SortDropdown from '@/components/common/SortDropdown';
import CategoryFilterDropdown from '@/components/common/CategoryFilterDropdown'; // Importar

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroCarousel />
      <WelcomeAuthSection />

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-headline font-bold text-foreground text-center md:text-left whitespace-nowrap">
            Nossos Produtos
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <CategoryFilterDropdown />
            <SortDropdown />
          </div>
        </div>
        <ProductGallery />
      </section>
    </div>
  );
}
