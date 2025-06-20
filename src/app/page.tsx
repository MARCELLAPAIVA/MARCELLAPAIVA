
"use client"; // ESSENCIAL para hooks como useEffect e logs no navegador

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Este log DEVE aparecer no console do NAVEGADOR se a página estiver sendo renderizada no cliente.
    console.warn("HomePage (Ultra Simples): useEffect EXECUTADO! Componente montado no cliente.");
  }, []); // Array de dependência vazio para executar apenas uma vez na montagem

  // Este log DEVE aparecer se o corpo da função do componente for executado.
  console.warn("HomePage (Ultra Simples): Corpo da função EXECUTADO!");

  return (
    <div style={{ padding: '20px', border: '2px solid red', minHeight: '300px' }}>
      <h1 style={{ fontSize: '24px', color: 'red' }}>Página de Teste Ultra Simples</h1>
      <p>Se você vê esta mensagem e o console.warn acima no console do NAVEGADOR, a página raiz está funcionando no cliente.</p>
      <p>Verifique o console do NAVEGADOR.</p>
    </div>
  );
}
