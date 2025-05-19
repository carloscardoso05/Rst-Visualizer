import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export const DocumentsNameAndCodeDocument = gql`
    query DocumentsNameAndCode {
  documents {
    id
    name
    code
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DocumentsNameAndCodeGQL extends Apollo.Query<DocumentsNameAndCodeQuery, DocumentsNameAndCodeQueryVariables> {
    document = DocumentsNameAndCodeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DocumentsNameTextDocument = gql`
    query DocumentsNameText {
  documents {
    id
    name
    root {
      text
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DocumentsNameTextGQL extends Apollo.Query<DocumentsNameTextQuery, DocumentsNameTextQueryVariables> {
    document = DocumentsNameTextDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DocumentPageQueryDocument = gql`
    query DocumentPageQuery($id: Int!) {
  documents(id: $id) {
    id
    name
    formattedText
    intraSententialRelations {
      id
      text
      tokensIds {
        id
        token
      }
      parent {
        id
        text
        tokensIds {
          id
          token
        }
      }
      relation {
        name
      }
      signals {
        text
        type
        subtype
        tokensIds
      }
    }
    root {
      tokensIds {
        id
        token
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DocumentPageQueryGQL extends Apollo.Query<DocumentPageQueryQuery, DocumentPageQueryQueryVariables> {
    document = DocumentPageQueryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RelationsDataDocument = gql`
    query RelationsData {
  documents {
    id
    name
    intraSententialRelations {
      id
      text
      tokensIds {
        id
        token
      }
      parent {
        id
        text
        tokensIds {
          id
          token
        }
      }
      relation {
        name
      }
      signals {
        text
        type
        subtype
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RelationsDataGQL extends Apollo.Query<RelationsDataQuery, RelationsDataQueryVariables> {
    document = RelationsDataDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Group = {
  __typename?: 'Group';
  children: Array<Node>;
  id: Scalars['Int']['output'];
  initialTokenId: Scalars['Int']['output'];
  isMultinuclear: Scalars['Boolean']['output'];
  parent?: Maybe<Node>;
  relation?: Maybe<Relation>;
  signals: Array<Signal>;
  text: Scalars['String']['output'];
  tokensIds: Array<TokenId>;
  type: Scalars['String']['output'];
};

export type Node = {
  __typename?: 'Node';
  children: Array<Node>;
  id: Scalars['Int']['output'];
  initialTokenId: Scalars['Int']['output'];
  isMultinuclear: Scalars['Boolean']['output'];
  parent?: Maybe<Node>;
  relation?: Maybe<Relation>;
  signals: Array<Signal>;
  text: Scalars['String']['output'];
  tokensIds: Array<TokenId>;
};

export type Query = {
  __typename?: 'Query';
  documents: Array<Rs3Document>;
  relation: Relation;
};


export type QueryDocumentsArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Rs3Document = {
  __typename?: 'RS3Document';
  code: Scalars['String']['output'];
  formattedText?: Maybe<Scalars['String']['output']>;
  groups: Array<Group>;
  id: Scalars['Int']['output'];
  intraSententialRelations: Array<Node>;
  name: Scalars['String']['output'];
  nodes: Array<Node>;
  path: Scalars['String']['output'];
  relations: Array<Relation>;
  root: Node;
  segments: Array<Segment>;
  signals: Array<Signal>;
};

export type Relation = {
  __typename?: 'Relation';
  name: Scalars['String']['output'];
  nodes: Array<Node>;
  type: Scalars['String']['output'];
};

export type Segment = {
  __typename?: 'Segment';
  children: Array<Node>;
  id: Scalars['Int']['output'];
  initialTokenId: Scalars['Int']['output'];
  innerText: Scalars['String']['output'];
  isMultinuclear: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  parent?: Maybe<Node>;
  relation?: Maybe<Relation>;
  sentenceId: Scalars['Int']['output'];
  signals: Array<Signal>;
  text: Scalars['String']['output'];
  tokensIds: Array<TokenId>;
};

export type Signal = {
  __typename?: 'Signal';
  id: Scalars['Int']['output'];
  source: Node;
  subtype: Scalars['String']['output'];
  text: Scalars['String']['output'];
  tokens: Array<Scalars['String']['output']>;
  tokensIds: Array<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type TokenId = {
  __typename?: 'TokenId';
  id: Scalars['Int']['output'];
  token: Scalars['String']['output'];
};

export type DocumentsNameAndCodeQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentsNameAndCodeQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'RS3Document', id: number, name: string, code: string }> };

export type DocumentsNameTextQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentsNameTextQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'RS3Document', id: number, name: string, root: { __typename?: 'Node', text: string } }> };

export type DocumentPageQueryQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DocumentPageQueryQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'RS3Document', id: number, name: string, formattedText?: string | null, intraSententialRelations: Array<{ __typename?: 'Node', id: number, text: string, tokensIds: Array<{ __typename?: 'TokenId', id: number, token: string }>, parent?: { __typename?: 'Node', id: number, text: string, tokensIds: Array<{ __typename?: 'TokenId', id: number, token: string }> } | null, relation?: { __typename?: 'Relation', name: string } | null, signals: Array<{ __typename?: 'Signal', text: string, type: string, subtype: string, tokensIds: Array<number> }> }>, root: { __typename?: 'Node', tokensIds: Array<{ __typename?: 'TokenId', id: number, token: string }> } }> };

export type RelationsDataQueryVariables = Exact<{ [key: string]: never; }>;


export type RelationsDataQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'RS3Document', id: number, name: string, intraSententialRelations: Array<{ __typename?: 'Node', id: number, text: string, tokensIds: Array<{ __typename?: 'TokenId', id: number, token: string }>, parent?: { __typename?: 'Node', id: number, text: string, tokensIds: Array<{ __typename?: 'TokenId', id: number, token: string }> } | null, relation?: { __typename?: 'Relation', name: string } | null, signals: Array<{ __typename?: 'Signal', text: string, type: string, subtype: string }> }> }> };


      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    