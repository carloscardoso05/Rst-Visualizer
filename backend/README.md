# RST Processing API

API NestJS em TypeScript para processar arquivos RST (Rhetorical Structure Theory) em formato .rs3.

## Descrição

Esta aplicação converte o código Python original para TypeScript/NestJS, mantendo toda a funcionalidade de:
- Processamento de arquivos .rs3 (XML)
- Análise de relações intra-sentenciais em documentos RST
- Geração de relatórios em Excel com contagens de relações
- API REST para integração com outras aplicações

## Funcionalidades

- **Processamento em lote**: Processa todos os arquivos .rs3 em um diretório
- **Análise RST**: Identifica e conta relações intra-sentenciais
- **Geração de relatórios**: Cria arquivos Excel com resultados
- **API REST**: Endpoints para processamento e download de resultados
- **Validação de tipos**: TypeScript estrito sem uso de `any`

## Instalação

```bash
$ npm install
```

## Executando a aplicação

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### `GET /rst/status`
Verifica o status do serviço.

### `POST /rst/process`
Processa um diretório e retorna resultados em JSON.

**Body:**
```json
{
  "directoryPath": "/caminho/para/diretorio/com/arquivos/rs3"
}
```

### `POST /rst/process-and-download`
Processa um diretório e baixa o arquivo Excel gerado.

**Body:**
```json
{
  "directoryPath": "/caminho/para/diretorio/com/arquivos/rs3"
}
```

### `GET /rst/sample-directory`
Retorna documentação e exemplos de uso da API.

## Estrutura do Projeto

```
src/
├── controllers/          # Controllers da API REST
│   └── rst.controller.ts
├── models/              # Modelos de dados TypeScript
│   ├── relation.model.ts
│   ├── node.model.ts
│   ├── signal.model.ts
│   ├── rst.model.ts
│   └── index.ts
├── services/            # Lógica de negócio
│   └── rst-processing.service.ts
├── utils/               # Utilitários
│   └── file-utils.ts
├── app.module.ts        # Módulo principal
└── main.ts             # Ponto de entrada
```

## Modelos de Dados

- **Relation**: Tipos de relações RST
- **Node**: Classe abstrata para nós da árvore RST
- **Group**: Nós agrupadores na árvore
- **Segment**: Nós folha com texto
- **Signal**: Marcadores/sinalizadores RST
- **Rst**: Documento RST completo

## Testes

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js
- **TypeScript**: Linguagem de programação
- **xml2js**: Parser XML
- **xlsx**: Geração de arquivos Excel
- **class-validator**: Validação de dados
- **class-transformer**: Transformação de objetos

## Comparação com Python Original

Esta implementação mantém toda a funcionalidade do código Python original:

| Funcionalidade | Python | TypeScript/NestJS |
|---|---|---|
| Parsing XML | xmltodict | xml2js |
| Geração Excel | pandas + openpyxl | xlsx |
| Progresso | tqdm | console.log customizado |
| Encoding | chardet | Detecção customizada |
| Validação | Pydantic | class-validator |
| API | - | NestJS REST API |

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
