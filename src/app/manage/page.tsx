
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProductForm from '@/components/products/ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2, AlertTriangle, Edit3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageProductsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { products, removeProduct, isHydrated: productsAreHydrated } = useProducts();
  const { toast } = useToast();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.push('/login');
    }
  }, [user, authIsLoading, router]);

  const handleDelete = (id: string, productName?: string) => {
    removeProduct(id);
    toast({
      title: "Produto Removido",
      description: `O produto "${productName || 'selecionado'}" foi removido com sucesso.`,
      variant: "destructive",
    });
  };

  if (authIsLoading || !productsAreHydrated) {
    return (
      <div className="space-y-12">
        <section>
          <Skeleton className="h-12 w-1/2 mx-auto mb-8 bg-muted" />
          <Skeleton className="h-96 w-full bg-muted rounded-lg" /> {/* Increased height for form skeleton */}
        </section>
        <section>
          <Skeleton className="h-10 w-1/3 mx-auto mb-8 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader className="p-0 relative aspect-video">
                  <Skeleton className="w-full h-full rounded-t-lg bg-muted" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-4/5 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-3/5 mb-2 bg-muted" />
                  <Skeleton className="h-6 w-1/3 bg-muted" /> {/* Skeleton for price */}
                </CardContent>
                <CardFooter className="p-4 flex justify-end space-x-2">
                  <Skeleton className="h-10 w-10 bg-muted rounded-md" />
                  <Skeleton className="h-10 w-10 bg-muted rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p className="text-primary text-xl">Redirecionando para o login...</p>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-4xl font-headline font-bold text-foreground mb-8 text-center">
          Adicionar Novo Produto
        </h2>
        <ProductForm />
      </section>

      <section>
        <h3 className="text-3xl font-headline text-foreground mb-8 text-center">Produtos Cadastrados</h3>
        
        {products.length === 0 && (
           <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
            <AlertTriangle size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-headline text-foreground mb-2">Nenhum Produto Cadastrado</h2>
            <p className="text-muted-foreground font-body">
              Adicione novos produtos utilizando o formulário acima.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const safeDescription = product.description || "Descrição não disponível";
              const truncatedDescription = safeDescription.substring(0, 30) + (safeDescription.length > 30 ? '...' : '');
              const altText = (product.description || "Imagem do produto").substring(0,50);
              const productNameForToast = (product.description || "Produto selecionado").substring(0,20);
              const productNameForDialog = (product.description || "este produto").substring(0,20);


              return (
                <Card key={product.id} className="bg-card border-border flex flex-col justify-between shadow-lg">
                  <CardHeader className="p-0 relative aspect-[16/10]">
                    {product.imageBase64 && (
                      <Image
                        src={product.imageBase64}
                        alt={altText}
                        fill
                        className="object-cover w-full h-full rounded-t-lg"
                        data-ai-hint="product tobacco accessory"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg font-headline text-primary mb-1 line-clamp-1">
                       {truncatedDescription}
                    </CardTitle>
                    <p className="text-2xl font-bold text-foreground mb-2">
                      {typeof product.price === 'number' 
                        ? product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'Preço não definido'}
                    </p>
                    <CardDescription className="text-card-foreground/80 font-body text-sm line-clamp-3">
                      {safeDescription}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-end items-center space-x-2 border-t border-border mt-auto">
                    {/* Edit button - non-functional for now */}
                    <Button variant="outline" size="icon" disabled className="border-primary text-primary hover:bg-primary/10">
                      <Edit3 size={18} />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 size={18} />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-primary">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-headline text-foreground">Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription className="text-card-foreground">
                            Tem certeza que deseja remover o produto "{productNameForDialog}{safeDescription.length > 20 ? '...' : ''}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(product.id, productNameForToast)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
