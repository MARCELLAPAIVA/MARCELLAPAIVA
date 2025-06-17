
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, ArrowLeft, MessageSquareQuote } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    generateWhatsAppMessage,
    isCartVisibleToUser 
  } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const WHATSAPP_NUMBER = "5521991633082"; // Seu número do WhatsApp

  useEffect(() => {
    if (!authLoading && !isCartVisibleToUser) {
      toast({
        title: "Acesso Negado",
        description: "Faça login com uma conta aprovada para acessar seu orçamento.",
        variant: "destructive",
      });
      router.push('/login?redirect=/cart');
    }
  }, [authLoading, isCartVisibleToUser, router, toast]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      updateQuantity(productId, 1); // Força a quantidade mínima como 1 se tentar ir abaixo
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleSendOrder = () => {
    if (cartItems.length === 0) {
      toast({ title: "Orçamento Vazio", description: "Adicione itens ao seu orçamento antes de enviar.", variant: "default" });
      return;
    }
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({ title: "Pedido Enviado!", description: "Seu pedido foi encaminhado via WhatsApp. Aguarde o contato.", variant: "default", duration: 7000 });
    // clearCart(); // Opcional: Limpar carrinho após enviar
  };
  
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 bg-muted" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg bg-card">
              <Skeleton className="h-20 w-20 rounded bg-muted" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
              <Skeleton className="h-8 w-20 bg-muted" />
              <Skeleton className="h-8 w-8 bg-muted" />
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-end space-y-4">
          <Skeleton className="h-6 w-32 bg-muted" />
          <Skeleton className="h-12 w-48 bg-muted" />
          <Skeleton className="h-10 w-32 bg-muted" />
        </div>
      </div>
    );
  }

  if (!isCartVisibleToUser && !authLoading) {
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p className="text-primary text-xl">Redirecionando para login...</p>
        </div>
    );
  }


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 border-primary text-primary hover:bg-primary/10">
        <ArrowLeft size={18} className="mr-2" />
        Voltar
      </Button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-headline text-foreground">Seu Orçamento</h1>
        {cartItems.length > 0 && (
          <Button variant="outline" onClick={clearCart} className="text-sm border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 size={16} className="mr-2" />
            Limpar Orçamento
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-md border border-border">
          <ShoppingBag size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-headline text-foreground mb-2">Seu orçamento está vazio.</h2>
          <p className="text-muted-foreground font-body mb-6">
            Adicione produtos para solicitar um orçamento.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">Ver Produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.product.id} className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg bg-card shadow">
              <Image
                src={item.product.imageUrl || "https://placehold.co/100x100.png"}
                alt={item.product.description}
                width={80}
                height={80}
                className="rounded object-cover aspect-square"
                data-ai-hint="product tobacco accessory"
              />
              <div className="flex-grow text-center sm:text-left">
                <p className="font-semibold text-foreground line-clamp-2">{item.product.description}</p>
                {typeof item.product.price === 'number' && (
                  <p className="text-sm text-primary">
                    {item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value))}
                  className="w-20 h-9 text-center bg-input border-border focus:ring-primary"
                  aria-label={`Quantidade de ${item.product.description}`}
                />
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 size={18} />
                  <span className="sr-only">Remover {item.product.description}</span>
                </Button>
              </div>
            </div>
          ))}
          <Separator className="my-8 bg-border" />
          <div className="flex flex-col items-center sm:items-end space-y-4">
            <p className="text-xl font-semibold text-foreground">
              Total de Itens: {getTotalItems()}
            </p>
            <Button 
              size="lg" 
              onClick={handleSendOrder} 
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-headline py-3 px-6 rounded-md text-lg"
            >
              <MessageSquareQuote size={20} className="mr-2" /> {/* Ícone para WhatsApp */}
              Enviar Pedido via WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
