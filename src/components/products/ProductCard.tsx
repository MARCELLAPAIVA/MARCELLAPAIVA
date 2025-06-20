
"use client";

// import Image from 'next/image'; // Comentado temporariamente
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
  // Log MUITO importante no início do componente
  console.warn(`ProductCard: Component rendering. Product received:`, product);

  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  if (!product || !product.id) {
    console.error("ProductCard: CRITICAL - product prop is null, undefined, or missing an id. Cannot render card. Product was:", product);
    return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p>Erro: Dados do produto inválidos.</p>
      </Card>
    );
  }

  const safeDescription = product.description || "Nome do produto indisponível";
  const productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
  // const altText = product.imageName || product.description?.substring(0,50) || "Imagem do produto";

  console.log(`ProductCard: Processing product ID: ${product.id}, Name: '${productName}'. Image URL from prop: '${product.imageUrl}'`);
  
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      {/* Imagem comentada temporariamente para simplificar */}
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-xs text-muted-foreground p-2 text-center">
          ID: {product.id} <br />
          Imagem (URL): {product.imageUrl ? product.imageUrl.substring(0, 50) + "..." : "N/A"} <br/>
          (Preview da imagem desabilitado para teste)
        </p>
      </div>

      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <div>
          <p className="font-body text-sm text-foreground line-clamp-2 mb-1">
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
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao Orçamento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
