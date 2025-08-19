<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# RST Processing API - TypeScript/NestJS

Este projeto é uma API NestJS em TypeScript para processar arquivos RST (Rhetorical Structure Theory) em formato .rs3.

## Arquitetura do Projeto

- **Models**: Classes que representam entidades RST (Relation, Node, Group, Segment, Signal, Rst)
- **Services**: Lógica de negócio para processamento de arquivos RST
- **Controllers**: Endpoints da API REST
- **Utils**: Utilitários para manipulação de arquivos e encoding

## Funcionalidades Principais

1. Processamento de arquivos .rs3 (XML)
2. Análise de relações intra-sentenciais
3. Geração de relatórios em Excel
4. API REST para integração

## Regras de Desenvolvimento

1. **Não usar `any`**: Sempre definir tipos explícitos
2. **TypeScript strict**: Seguir configurações rigorosas do TypeScript
3. **NestJS patterns**: Usar decorators, injeção de dependência e módulos
4. **Error handling**: Sempre tratar erros adequadamente
5. **Async/await**: Usar para operações assíncronas

## Modelos Principais

- `Relation`: Representa tipos de relação RST
- `Node`: Classe abstrata para nós da árvore RST
- `Group`: Nó agrupador na árvore RST
- `Segment`: Nó folha com texto na árvore RST
- `Signal`: Marcadores/sinalizadores RST
- `Rst`: Classe principal que representa um documento RST completo

## APIs Disponíveis

- `GET /rst/status`: Status do serviço
- `POST /rst/process`: Processa diretório e retorna JSON
- `POST /rst/process-and-download`: Processa e baixa Excel
- `GET /rst/sample-directory`: Documentação de uso
