
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
  const { user, isLoading: authIsLoading } = useAuth(); // user now comes from Firebase Auth via context
  const router = useRouter();
  const { products, removeProduct, isLoading: productsLoading, isMutating } = useProducts();
  const { toast } = useToast();


  useEffect(() => {
    if (!authIsLoading) {
      if (!user) {
        toast({ title: "Acesso Negado", description: "Faça login para acessar esta página.", variant: "destructive" });
        router.push('/login?redirect=/manage');
      } else if (user.role !== 'admin') {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar esta página.", variant: "destructive" });
        router.push('/'); 
      }
    }
  }, [user, authIsLoading, router, toast]);

  const handleDelete = (id: string, imageUrl: string, productName?: string) => {
    removeProduct(id, imageUrl, productName); 
  };

  // Improved loading state: covers auth loading, redirection, and initial product loading for admins
  if (authIsLoading || (!user && !authIsLoading) || (user && user.role !== 'admin' && !authIsLoading) ) {
    return (
      <div className="space-y-12">
        <section>
          <Skeleton className="h-12 w-1/2 mx-auto mb-8 bg-muted" />
          <Skeleton className="h-96 w-full bg-muted rounded-lg" />
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
                  <Skeleton className="h-6 w-1/3 bg-muted" />
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
  
  // This check is for users who might have somehow bypassed the useEffect redirect
  // or if the state updates in a way that useEffect hasn't caught yet.
  if (!user || user.role !== 'admin') {
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p className="text-primary text-xl">Redirecionando...</p>
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
        
        {productsLoading && products.length === 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 3 }).map((_, index) => (
             <Card key={index} className="bg-card border-border">
               <CardHeader className="p-0 relative aspect-video">
                 <Skeleton className="w-full h-full rounded-t-lg bg-muted" />
               </CardHeader>
               <CardContent className="p-4">
                 <Skeleton className="h-4 w-4/5 mb-2 bg-muted" />
                 <Skeleton className="h-4 w-3/5 mb-2 bg-muted" />
                 <Skeleton className="h-6 w-1/3 bg-muted" />
               </CardContent>
               <CardFooter className="p-4 flex justify-end space-x-2">
                 <Skeleton className="h-10 w-10 bg-muted rounded-md" />
                 <Skeleton className="h-10 w-10 bg-muted rounded-md" />
               </CardFooter>
             </Card>
           ))}
         </div>
        )}

        {!productsLoading && products.length === 0 && (
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
              const altText = (product.imageName || product.description || "Imagem do produto").substring(0,50);
              const productNameForToast = (product.description || "Produto selecionado").substring(0,20);
              const productNameForDialog = (product.description || "este produto").substring(0,20);

              return (
                <Card key={product.id} className="bg-card border-border flex flex-col justify-between shadow-lg">
                  <CardHeader className="p-0 relative aspect-[16/10]">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={altText}
                        fill
                        className="object-cover w-full h-full rounded-t-lg"
                        data-ai-hint="product tobacco accessory"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full rounded-t-lg bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sem imagem</span>
                      </div>
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
                      {product.category ? `Categoria: ${product.category} - ` : ''}{safeDescription}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-end items-center space-x-2 border-t border-border mt-auto">
                    <Button variant="outline" size="icon" disabled className="border-primary text-primary hover:bg-primary/10">
                      <Edit3 size={18} />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={isMutating}>
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
                            onClick={() => handleDelete(product.id, product.imageUrl, productNameForToast)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            disabled={isMutating}
                          >
                            {isMutating ? "Removendo..." : "Confirmar"}
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
