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
  id: Scalars['Float']['output'];
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  relation?: Maybe<Relation>;
  signals: Array<Signal>;
  tokensById: Array<TokenId>;
  type: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  rst: Array<Rst>;
};


export type QueryRstArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type Relation = {
  __typename?: 'Relation';
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Rst = {
  __typename?: 'Rst';
  code: Scalars['String']['output'];
  fontText: Scalars['String']['output'];
  groups: Array<Group>;
  id: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  nodesIdsWithIntraSententialRelations: Array<Scalars['Int']['output']>;
  segments: Array<Segment>;
  text: Scalars['String']['output'];
};


export type RstGroupsArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  intraSententialRelation?: Scalars['Boolean']['input'];
  subtype?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RstSegmentsArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  intraSententialRelation?: Scalars['Boolean']['input'];
  subtype?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type RstTextArgs = {
  limitWords?: InputMaybe<Scalars['Int']['input']>;
};

export type Segment = {
  __typename?: 'Segment';
  id: Scalars['Float']['output'];
  initialTokenId: Scalars['Int']['output'];
  innerText: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  relation?: Maybe<Relation>;
  sentenceId: Scalars['Int']['output'];
  signals: Array<Signal>;
  tokensById: Array<TokenId>;
};

export type Signal = {
  __typename?: 'Signal';
  id: Scalars['Float']['output'];
  sourceNodeId: Scalars['Float']['output'];
  subtype: Scalars['String']['output'];
  tokensIndexes: Array<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type TokenId = {
  __typename?: 'TokenId';
  id: Scalars['Int']['output'];
  token: Scalars['String']['output'];
};

export type DocumentsInfoQueryVariables = Exact<{
  limitWords?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DocumentsInfoQuery = { __typename?: 'Query', rst: Array<{ __typename?: 'Rst', id: number, name: string, text: string }> };

export type DocumentDetailsQueryVariables = Exact<{
  documentId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DocumentDetailsQuery = { __typename?: 'Query', rst: Array<{ __typename?: 'Rst', id: number, name: string, nodesIdsWithIntraSententialRelations: Array<number>, fontText: string, segments: Array<{ __typename?: 'Segment', id: number, parentId?: number | null, order: number, tokensById: Array<{ __typename?: 'TokenId', id: number, token: string }>, relation?: { __typename?: 'Relation', name: string, type: string } | null, signals: Array<{ __typename?: 'Signal', id: number, type: string, subtype: string, tokensIndexes: Array<number> }> }>, groups: Array<{ __typename?: 'Group', id: number, parentId?: number | null, order: number, tokensById: Array<{ __typename?: 'TokenId', id: number, token: string }>, relation?: { __typename?: 'Relation', name: string, type: string } | null, signals: Array<{ __typename?: 'Signal', id: number, type: string, subtype: string, tokensIndexes: Array<number> }> }> }> };

export type RelationsBySignalsQueryVariables = Exact<{ [key: string]: never; }>;


export type RelationsBySignalsQuery = { __typename?: 'Query', rst: Array<{ __typename?: 'Rst', id: number, name: string, segments: Array<{ __typename?: 'Segment', id: number, tokensById: Array<{ __typename?: 'TokenId', id: number, token: string }>, relation?: { __typename?: 'Relation', name: string, type: string } | null, signals: Array<{ __typename?: 'Signal', id: number, type: string, subtype: string, tokensIndexes: Array<number> }> }>, groups: Array<{ __typename?: 'Group', id: number, tokensById: Array<{ __typename?: 'TokenId', id: number, token: string }>, relation?: { __typename?: 'Relation', name: string, type: string } | null, signals: Array<{ __typename?: 'Signal', id: number, type: string, subtype: string, tokensIndexes: Array<number> }> }> }> };

export const DocumentsInfoDocument = gql`
    query DocumentsInfo($limitWords: Int) {
  rst {
    id
    name
    text(limitWords: $limitWords)
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DocumentsInfoGQL extends Apollo.Query<DocumentsInfoQuery, DocumentsInfoQueryVariables> {
    document = DocumentsInfoDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DocumentDetailsDocument = gql`
    query DocumentDetails($documentId: Int) {
  rst(id: $documentId) {
    id
    name
    nodesIdsWithIntraSententialRelations
    fontText
    segments {
      id
      parentId
      order
      tokensById {
        id
        token
      }
      relation {
        name
        type
      }
      signals {
        id
        type
        subtype
        tokensIndexes
      }
    }
    groups {
      id
      parentId
      order
      tokensById {
        id
        token
      }
      relation {
        name
        type
      }
      signals {
        id
        type
        subtype
        tokensIndexes
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DocumentDetailsGQL extends Apollo.Query<DocumentDetailsQuery, DocumentDetailsQueryVariables> {
    document = DocumentDetailsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RelationsBySignalsDocument = gql`
    query RelationsBySignals {
  rst {
    id
    name
    segments(intraSententialRelation: true) {
      id
      tokensById {
        id
        token
      }
      relation {
        name
        type
      }
      signals {
        id
        type
        subtype
        tokensIndexes
      }
    }
    groups(intraSententialRelation: true) {
      id
      tokensById {
        id
        token
      }
      relation {
        name
        type
      }
      signals {
        id
        type
        subtype
        tokensIndexes
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RelationsBySignalsGQL extends Apollo.Query<RelationsBySignalsQuery, RelationsBySignalsQueryVariables> {
    document = RelationsBySignalsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    