import ProductGallery from '@/components/products/ProductGallery';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <h2 className="text-5xl font-headline font-bold text-primary mb-4">
          Bem-vindo à M&amp;T Tabacaria
        </h2>
        <p className="text-xl text-accent-foreground font-body max-w-2xl mx-auto">
          Descubra nossa seleção exclusiva de produtos de alta qualidade.
        </p>
      </section>

      <section>
        <h3 className="text-3xl font-headline text-primary mb-8 text-center">Nossos Produtos</h3>
        <ProductGallery />
      </section>
    </div>
  );
}
