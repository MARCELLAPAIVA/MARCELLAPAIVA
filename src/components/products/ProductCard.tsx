
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  console.warn(`ProductCard: Component rendering. Product ID: ${product?.id}`);

  if (!product || !product.id || typeof product.id !== 'string') {
    console.error("ProductCard: CRITICAL - product prop is null, undefined, or missing/invalid id. Cannot render card. Product was:", product);
    return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p>Erro: Dados do produto inválidos no ProductCard.</p>
        <pre className="text-xs whitespace-pre-wrap">{product ? JSON.stringify(product, null, 2) : "Produto Nulo/Indefinido"}</pre>
      </Card>
    );
  }

  try {
    console.warn(`ProductCard: Full product object for ID ${product.id}:`, JSON.parse(JSON.stringify(product)));
  } catch (e) {
    console.warn(`ProductCard: Full product object for ID ${product.id} (raw, stringify failed):`, product);
  }

  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  const safeDescription = product.description || "Nome do produto indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  // Usar product.imageName para o alt text se existir, senão a descrição.
  // product.imageName contém o nome original do arquivo que o usuário enviou.
  const altText = product.imageName || safeDescription.substring(0, 50) || "Imagem do produto";

  console.warn(`ProductCard: Processing product '${productName}'. Attempted Image URL: '${product.imageUrl}'. Alt text: '${altText}'`);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`ProductCard: Error loading image for product ${product.id}. URL: ${product.imageUrl}`, e.target);
    if (e.target instanceof HTMLImageElement) {
        console.error(`ProductCard: Failing image element src was: ${e.target.currentSrc || e.target.src}`);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://');

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center">
        {isValidImageUrl ? (
          <Image
            src={product.imageUrl} // Esta deve ser a URL de download completa do Firebase Storage
            alt={altText}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            onError={handleImageError}
            data-ai-hint="product tobacco accessory"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground text-sm p-2 text-center">
            {product.imageUrl ? `URL da imagem inválida ou ausente: ${String(product.imageUrl).substring(0,50)}...` : "Sem imagem"}
          </div>
        )}
      </div>

      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <div>
          <p className="font-body text-sm text-foreground line-clamp-2 mb-1" title={safeDescription}>
            {productName}
          </p>
          {user && user.status === 'approved' ? (
            typeof product.price === 'number' ? (
              <p className="font-headline text-lg text-primary font-semibold">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            ) : (
              <p className="font-headline text-sm text-muted-foreground">Preço não disponível</p>
            )
          ) : (
            <div className="text-center mt-1">
              <p className="text-xs text-muted-foreground mb-1">Preço sob consulta</p>
              <Button variant="link" asChild className="p-0 h-auto text-sm text-primary hover:text-primary/80">
                  <Link href="/login">Entrar para ver o preço</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      {isCartVisibleToUser && (
        <CardFooter className="p-3 border-t border-border/20">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleAddToCart}
            disabled={!isValidImageUrl}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
