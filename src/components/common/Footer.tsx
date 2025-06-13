import { Instagram, MessageCircle, MapPin, Phone } from 'lucide-react'; // Using MessageCircle for WhatsApp

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground py-8 shadow-inner mt-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-headline text-primary mb-6">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center">
            <a 
              href="https://instagram.com/yourprofile" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram M&T Tabacaria"
              className="flex items-center space-x-2 text-accent-foreground hover:text-primary transition-colors"
            >
              <Instagram size={28} className="text-primary" />
              <span className="font-body">@seuinstagram</span>
            </a>
          </div>
          <div className="flex flex-col items-center">
             <a 
              href="https://wa.me/yourphonenumber" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="WhatsApp M&T Tabacaria"
              className="flex items-center space-x-2 text-accent-foreground hover:text-primary transition-colors"
            >
              <MessageCircle size={28} className="text-primary" />
              <span className="font-body">(XX) XXXXX-XXXX</span>
            </a>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 text-accent-foreground">
              <MapPin size={28} className="text-primary" />
              <span className="font-body">Seu Endereço, Número, Cidade - UF</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-body">
          &copy; {year} M&amp;T Tabacaria. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
