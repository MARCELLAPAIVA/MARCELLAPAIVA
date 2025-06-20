
"use client";

// import Image from 'next/image'; // Temporarily removed
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
  console.error(`ProductCard: Component rendering. Received product prop:`, product);

  if (!product || typeof product.id !== 'string') {
    console.error("ProductCard: CRITICAL - product prop is null, undefined, or missing/invalid id. Cannot render card. Product was:", product);
    return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p>Erro: Dados do produto inválidos no ProductCard (product NULO ou ID inválido).</p>
        <pre className="text-xs whitespace-pre-wrap">{product ? JSON.stringify(product, null, 2) : "Produto Nulo/Indefinido"}</pre>
      </Card>
    );
  }
  
  // Log individual properties to catch errors if product is not fully formed
  let safeDescription = "Descrição Indisponível";
  let productName = "Nome Indisponível";
  let imageUrlLog = "URL da Imagem Indisponível";

  try {
    safeDescription = product.description || "Descrição padrão se nula";
    productName = safeDescription.substring(0, 40) + (safeDescription.length > 40 ? "..." : "");
    imageUrlLog = product.imageUrl || "URL padrão se nula";
    console.warn(`ProductCard: Processing Product ID: ${product.id}, Description: ${productName}, ImageUrl: ${imageUrlLog}`);
  } catch (e: any) {
    console.error(`ProductCard: Error accessing product properties for ID ${product?.id}. Error: ${e.message}`, product);
     return (
      <Card className="bg-destructive border-destructive text-destructive-foreground p-4">
        <p>Erro: Falha ao acessar propriedades do produto ID: {product?.id}.</p>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(product, null, 2)}</pre>
      </Card>
    );
  }


  const { user } = useAuth();
  const { addToCart, isCartVisibleToUser } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const isValidImageUrl = product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://firebasestorage.googleapis.com');

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted flex items-center justify-center p-2 text-center">
        {/* Temporarily replacing Image component with text representation */}
        <p className="text-xs text-muted-foreground">DEBUG:</p>
        <p className="text-xs text-muted-foreground truncate" title={product.imageUrl}>
          ImgURL: {product.imageUrl ? product.imageUrl.substring(0,50) + "..." : "N/A"}
        </p>
        <p className="text-xs text-muted-foreground">
          Valida? {isValidImageUrl ? "Sim" : "Não"}
        </p>
        {!isValidImageUrl && <p className="text-xs text-red-500">URL da imagem parece inválida!</p>}
      </div>

      <CardContent className="p-3 flex-grow flex flex-col justify-between items-center text-center">
        <div>
          <p className="font-body text-sm text-foreground line-clamp-2 mb-1" title={safeDescription}>
            {productName} (ID: {product.id.substring(0,5)})
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
