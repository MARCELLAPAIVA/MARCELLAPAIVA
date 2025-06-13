"use client";

import ProductForm from '@/components/products/ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2, Edit3, AlertTriangle } from 'lucide-react'; // Edit3 icon can be used if edit functionality is added later
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
  const { products, removeProduct, isHydrated } = useProducts();
  const { toast } = useToast();

  const handleDelete = (id: string, productName?: string) => {
    removeProduct(id);
    toast({
      title: "Produto Removido",
      description: `O produto "${productName || ' selecionado'}" foi removido com sucesso.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-4xl font-headline font-bold text-primary mb-8 text-center">
          Gerenciar Produtos
        </h2>
        <ProductForm />
      </section>

      <section>
        <h3 className="text-3xl font-headline text-primary mb-8 text-center">Produtos Cadastrados</h3>
        {!isHydrated && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader className="p-0 relative aspect-video">
                  <Skeleton className="w-full h-full rounded-t-lg bg-muted/50" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-4/5 mb-2 bg-muted/50" />
                  <Skeleton className="h-4 w-3/5 bg-muted/50" />
                </CardContent>
                <CardFooter className="p-4 flex justify-end">
                  <Skeleton className="h-10 w-24 bg-muted/50" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {isHydrated && products.length === 0 && (
           <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-md border border-border">
            <AlertTriangle size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-headline text-primary mb-2">Nenhum Produto Cadastrado</h2>
            <p className="text-muted-foreground font-body">
              Adicione novos produtos utilizando o formulário acima.
            </p>
          </div>
        )}

        {isHydrated && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-card border-border flex flex-col justify-between shadow-lg">
                <CardHeader className="p-0 relative aspect-video">
                  {product.imageBase64 && (
                    <Image
                      src={product.imageBase64}
                      alt={product.description.substring(0,30) || "Imagem do produto"}
                      width={400}
                      height={225}
                      className="object-cover w-full h-full rounded-t-lg"
                      data-ai-hint="product tobacco accessory"
                    />
                  )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardDescription className="text-foreground font-body line-clamp-4">
                    {product.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 flex justify-end items-center space-x-2 border-t border-border mt-auto">
                  {/* Edit button placeholder, can be implemented later */}
                  {/* <Button variant="outline" size="icon" className="text-primary border-primary hover:bg-primary/10">
                    <Edit3 size={18} />
                    <span className="sr-only">Editar</span>
                  </Button> */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 size={18} />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-primary">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-primary">Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="text-card-foreground">
                          Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(product.id, product.description.substring(0,20))}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
