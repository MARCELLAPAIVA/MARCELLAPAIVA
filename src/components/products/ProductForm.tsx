
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UploadCloud, XCircle, DollarSign } from 'lucide-react';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productFormSchema = z.object({
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }).max(500, { message: "A descrição não pode exceder 500 caracteres." }),
  price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }).min(0.01, {message: "O preço deve ser maior que zero."}),
  image: z.custom<FileList>()
    .refine((files) => files && files.length > 0, "A imagem é obrigatória.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `O tamanho máximo da imagem é ${MAX_FILE_SIZE_MB}MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Apenas formatos .jpg, .jpeg, .png e .webp são suportados."
    ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm() {
  const { addProduct } = useProducts();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      description: "",
      price: undefined,
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (data.image && data.image.length > 0) {
      const file = data.image[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        addProduct({
          description: data.description,
          price: data.price,
          imageBase64: reader.result as string,
          imageName: file.name,
        });
        toast({
          title: "Sucesso!",
          description: "Produto adicionado com sucesso.",
          variant: "default",
        });
        form.reset();
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const imageFile = form.watch("image");

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const clearImage = () => {
    form.setValue("image", undefined as any, { shouldValidate: true }); 
    setImagePreview(null);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-headline text-lg">Descrição do Produto</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o produto, material, origem, etc."
                  className="resize-none bg-input border-border focus:border-primary focus:ring-primary"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-headline text-lg">Preço (R$)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 29.90"
                    className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-headline text-lg">Imagem do Produto</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center space-y-4">
                  <Input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => field.onChange(e.target.files)}
                    ref={field.ref}
                  />
                  <Label 
                    htmlFor="file-upload"
                    className="w-full h-48 border-2 border-dashed border-border hover:border-primary transition-colors rounded-lg flex flex-col items-center justify-center cursor-pointer bg-input/50 hover:bg-input"
                  >
                    <UploadCloud size={48} className="text-muted-foreground mb-2" />
                    <span className="text-muted-foreground">Clique ou arraste para enviar</span>
                    <span className="text-xs text-muted-foreground/80 mt-1">PNG, JPG, JPEG, WEBP (MAX. {MAX_FILE_SIZE_MB}MB)</span>
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {imagePreview && (
          <div className="relative group w-48 h-48 mx-auto border border-primary rounded-md overflow-hidden shadow-md">
            <Image src={imagePreview} alt="Pré-visualização da imagem" layout="fill" objectFit="cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-8 h-8"
              onClick={clearImage}
              aria-label="Remover imagem"
            >
              <XCircle size={20} />
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-3 rounded-md" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adicionando..." : "Adicionar Produto"}
        </Button>
      </form>
    </Form>
  );
}
