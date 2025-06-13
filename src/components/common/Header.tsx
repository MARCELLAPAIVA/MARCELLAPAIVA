import Link from 'next/link';
import { ShoppingBag } from 'lucide-react'; // Using ShoppingBag as a generic shop icon

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <ShoppingBag size={32} />
          <h1 className="text-3xl font-headline font-bold">
            M&amp;T Tabacaria
          </h1>
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Produtos
              </Link>
            </li>
            <li>
              <Link href="/manage" className="text-foreground hover:text-primary transition-colors font-medium">
                Gerenciar Produtos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
