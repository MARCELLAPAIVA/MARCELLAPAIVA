
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/common/Header';
// CategoriesBar is removed as its functionality is moved to the Header
import { AuthProvider } from '@/contexts/AuthContext';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export const metadata: Metadata = {
  title: 'M&T TABACARIA',
  description: 'Exclusivos produtos de tabacaria e acessórios.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 pb-8"> {/* Adjusted pb-20 to pb-8 */}
            {children}
          </main>
          <WhatsAppButton />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
