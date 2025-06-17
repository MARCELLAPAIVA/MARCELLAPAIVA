
"use client";

import { Button } from "@/components/ui/button";
// Using an inline SVG for WhatsApp icon as lucide-react doesn't have a direct one
// that matches the typical style.

const WhatsAppIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.82L2.05 22L7.31 20.52C8.75 21.31 10.36 21.79 12.04 21.79C17.5 21.79 21.95 17.34 21.95 11.88C21.95 9.27 20.92 6.84 19.13 4.96C17.34 3.1 14.82 2 12.04 2ZM17.96 15.2C17.73 15.71 16.79 16.21 16.32 16.27C15.85 16.33 15.25 16.36 14.67 16.15C14.1 15.95 13.25 15.65 12.22 14.64C10.95 13.41 10.05 11.96 9.83 11.66C9.61 11.36 9.47 11.18 9.47 10.9C9.47 10.62 9.61 10.43 9.77 10.27C9.94 10.11 10.14 9.98 10.31 9.82C10.41 9.73 10.49 9.61 10.58 9.49C10.68 9.38 10.65 9.28 10.58 9.16L10.02 7.76C9.91 7.48 9.76 7.28 9.53 7.24C9.37 7.21 9.17 7.21 9 7.21C8.82 7.21 8.6 7.24 8.4 7.33C8.2 7.43 7.91 7.69 7.72 8.05C7.53 8.41 7.07 9.04 7.07 10.2C7.07 11.36 8.35 12.49 8.52 12.69C8.68 12.89 10.02 14.99 12.08 15.78C13.56 16.32 14.07 16.5 14.52 16.44C15.08 16.36 15.71 16.03 15.97 15.71C16.22 15.38 16.42 15.09 16.51 14.92C16.6 14.75 16.63 14.61 16.57 14.49C16.52 14.38 16.14 14.22 15.91 14.12C15.68 14.02 15.53 13.99 15.39 14.12C15.26 14.26 15.05 14.51 14.96 14.64C14.87 14.78 14.78 14.84 14.62 14.75C14.46 14.65 13.78 14.41 13.01 13.7C12.42 13.15 11.96 12.48 11.83 12.22C11.71 11.96 11.8 11.81 11.94 11.68C12.06 11.56 12.22 11.39 12.38 11.23L12.63 10.96C12.74 10.84 12.83 10.69 12.94 10.55C13.04 10.41 13.11 10.32 12.98 10.13C12.86 9.94 12.3 9.91 11.64 9.15"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);


export default function WhatsAppButton() {
  const whatsappNumber = "21991633082"; // Updated phone number
  const message = "Olá! Gostaria de mais informações."; // Optional pre-filled message

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleClick}
      variant="default"
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg z-40"
      aria-label="Contatar via WhatsApp"
    >
      <WhatsAppIcon />
    </Button>
  );
}
