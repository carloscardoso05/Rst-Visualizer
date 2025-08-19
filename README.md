# Guia de Uso - RST Visualizer

## O que o programa faz

O **RST Visualizer** é uma aplicação web completa para análise e visualização de documentos RST (Rhetorical Structure Theory). O sistema possui duas partes principais:

- **Interface web interativa** para navegar e visualizar documentos RST
- **Análise de relações retóricas** com contagem e filtragem por tipos
- **Visualização em árvore** das estruturas RST dos documentos
- **Busca e filtragem** de documentos e relações

### Funcionalidades principais:

- Visualizar documentos RST em uma interface web
- Visualizar relações intra-sentenciais em documentos anotados com a RST
- Buscar documentos por nome
- Buscar relações por tipo e subtipo de sinalizadores e nome do documento

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 20 ou superior**

   - Acesse [nodejs.org](https://nodejs.org/)
   - Baixe e instale a versão LTS recomendada
   - Durante a instalação, marque "Add to PATH" no Windows

2. **npm** (geralmente já vem com o Node.js)

3. **Git** (opcional; necessário apenas se quiser clonar o repositório)

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
   git clone https://github.com/carloscardoso05/Rst-Visualizer.git
   cd Rst-Visualizer
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

### Passo 3: Executar o programa

1. **Inicie o front-end e o back-end:**

   ```bash
   npm run start
   ```

2. **Abra o navegador** e acesse: [http://localhost:4200](http://localhost:4200)

### Passo 4: Usar a aplicação

#### Página inicial

- Visualize todos os documentos RST disponíveis.
- Use a barra de busca na lateral para encontrar documentos específicos.
- Clique em "Ver documento" no card ou no nome do documento na barra lateral para abrir a visualização detalhada.

#### Barra lateral
A barra lateral permite duas formas de pesquisa:

##### Pesquisa de documentos
Você pode digitar na barra de pesquisa para filtrar os documentos por nome.

##### Pesquisa de relações
Você pode pesquisar todas as relações encontradas e filtrá-las por tipo e subtipo de sinalizadores, se desejar, e até por nome do arquivo.


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
