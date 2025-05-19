import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/schema.gql',
  documents: 'src/**/*.gql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript-apollo-angular', 'typescript', 'typescript-operations', 'fragment-matcher'],
    },
  },
};

export default config;
