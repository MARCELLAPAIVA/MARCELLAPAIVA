# M&T Tabacaria

Bem-vindo ao repositório da M&T Tabacaria.

Este projeto contém o código-fonte para a loja online da M&T Tabacaria, desenvolvida com Next.js, Tailwind CSS, ShadCN UI e Firebase.

## Visão Geral

Aplicação para visualização de produtos de tabacaria e acessórios, permitindo que clientes aprovados solicitem orçamentos via WhatsApp. Administradores podem gerenciar produtos e aprovar cadastros de novos usuários.

## Tecnologias Utilizadas
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI
- Firebase (Autenticação, Firestore, Storage)
- Genkit (para futuras integrações de IA, se aplicável)

## Para Desenvolvedores

### Pré-requisitos
- Node.js (versão >=18.17.0, conforme especificado em `package.json`)
- npm

### Rodando Localmente
1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/MARCELLAPAIVA/MARCELLAPAIVA.git 
    # Ou o URL do seu repositório específico da loja, se for diferente
    cd NOME_DO_REPOSITORIO 
    # (Se o código estiver em MARCELLAPAIVA/MARCELLAPAIVA, será cd MARCELLAPAIVA)
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente do Firebase:**
    Crie um arquivo `.env.local` na raiz do projeto, se necessário, para as configurações do Firebase que não devem ir para o controle de versão (embora sua configuração atual esteja em `src/lib/firebase.ts`).
4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:9003` (ou a porta configurada).

### Estrutura do Projeto (Principais Pastas)
- `src/app/`: Contém as páginas e layouts da aplicação (Next.js App Router).
- `src/components/`: Componentes React reutilizáveis.
  - `common/`: Componentes gerais (Header, Footer, etc.).
  - `products/`: Componentes relacionados a produtos.
  - `ui/`: Componentes da biblioteca ShadCN UI.
  - `admin/`: Componentes para a área administrativa.
- `src/contexts/`: Contextos React (AuthContext, CartContext).
- `src/hooks/`: Hooks customizados (useProducts, useAuth, etc.).
- `src/lib/`: Configurações do Firebase, serviços (productService, userService), tipos e utilitários.
- `src/ai/`: Lógica relacionada à IA com Genkit (se utilizada).
- `public/`: Arquivos estáticos.

## Processo de Deploy
O deploy está configurado para ser feito através do Firebase App Hosting, conectado a este repositório GitHub. Alterações na branch `main` devem acionar um novo build e deploy automaticamente.
