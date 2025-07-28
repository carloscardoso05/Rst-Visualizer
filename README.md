# Guia de Uso - RST Visualizer

## O que o programa faz

O **RST Visualizer** é uma aplicação web completa para análise e visualização de documentos RST (Rhetorical Structure Theory). O sistema possui duas partes principais:

- **Interface web interativa** para navegar e visualizar documentos RST
- **Análise de relações retóricas** com contagem e filtragem por tipos
- **Visualização em árvore** das estruturas RST dos documentos
- **Busca e filtragem** de documentos e relações

### Funcionalidades principais:

- Visualizar documentos RST em uma interface web moderna
- Navegar pela estrutura hierárquica dos documentos
- Analisar relações retóricas intrasentenciais
- Filtrar relações por tipo, subtipo e sinalizadores
- Buscar documentos por nome
- Visualizar estatísticas de uso das relações

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18 ou superior**

   - Acesse [nodejs.org](https://nodejs.org/)
   - Baixe e instale a versão LTS recomendada
   - Durante a instalação, marque "Add to PATH" no Windows

2. **npm ou yarn** (geralmente vem com o Node.js)

3. **Git** (opcional, para clonar o repositório)

## Como usar este programa

### Passo 1: Preparar os arquivos

O projeto já vem configurado com vários arquivos `.rs3` dentro da pasta `backend/src/documents`.

**Para adicionar novos documentos:**

1. Coloque seus arquivos `.rs3` dentro da pasta `backend/src/documents`
2. Você pode organizá-los em subpastas da forma que preferir
3. O sistema carregará automaticamente todos os arquivos `.rs3` encontrados

### Passo 2: Instalação

1. **Clone ou baixe o projeto**

    Se quiser apenas baixar o projeto, use esse link [https://github.com/carloscardoso05/Rst-Visualizer/archive/refs/heads/main.zip](https://github.com/carloscardoso05/Rst-Visualizer/archive/refs/heads/main.zip). Baixe o projeto, descompacte o arquivo .zip, e abra a pasta descompactada na ferramenta de linha de comando (terminal, Powershell, etc.).

    Caso queria cloná-lo, execute:

   ```bash
   git clone git@github.com:carloscardoso05/Rst-Visualizer.git
   cd Rst-Visualizer
   ```

2. **Instale as dependências do backend**

   ```bash
   cd backend
   npm install
   ```

3. **Instale as dependências do frontend**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Volte para a pasta raiz**
   ```bash
   cd ..
   ```

### Passo 3: Executar o programa

1. **Abra dois terminais** (ou use abas diferentes)

2. **No primeiro terminal, inicie o backend:**

   ```bash
   cd backend
   npm run start:dev
   ```

   Aguarde até aparecer a mensagem indicando que o servidor está rodando na porta 3000.

3. **No segundo terminal, inicie o frontend:**

   ```bash
   cd frontend
   npm start
   ```

   Aguarde até aparecer a mensagem indicando que o servidor está rodando na porta 4200.

4. **Abra o navegador** e acesse: [http://localhost:4200](http://localhost:4200)

### Passo 4: Usar a aplicação

#### Página inicial

- Visualize todos os documentos RST disponíveis
- Use a barra de busca na lateral para encontrar documentos específicos
- Clique em "Ver documento" para abrir a visualização detalhada

#### Visualização de documentos

- Veja a estrutura hierárquica do documento em formato de árvore
- Navegue pelas relações retóricas
- Visualize o texto completo com as divisões estruturais

#### Análise de relações

- Acesse a seção "Relações" na barra lateral
- Filtre por tipo de relação (elaboration, contrast, attribution, etc.)
- Filtre por tipo de sinalizador
- Veja estatísticas de uso das relações

## Estrutura do projeto

```
rst-visualizer/
├── backend/                 # Servidor NestJS
│   ├── src/
│   │   ├── documents/      # Arquivos .rs3
│   │   ├── rs3/           # Módulos de análise RST
│   │   └── main.ts        # Entrada do servidor
│   └── package.json
├── frontend/               # Interface Angular
│   ├── src/
│   │   ├── app/          # Componentes da aplicação
│   │   └── main.ts       # Entrada da aplicação
│   └── package.json
└── README.md              # Este arquivo
```

## Tecnologias utilizadas

- **Backend**: NestJS, GraphQL, TypeScript, Node.js
- **Frontend**: Angular 19, TypeScript, TailwindCSS, DaisyUI
- **Análise**: Parser XML customizado para arquivos .rs3
