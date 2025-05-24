// Types based on the Python backend models
export interface Signal {
  id: number;
  source_id: number;
  type: string;
  subtype: string;
  tokens_ids: number[];
  text: string;
}

export interface Relation {
  name: string;
  type: string;
}

export interface Node {
  id: number;
  parent_id: number | null;
  relname: string | null;
  signals: Signal[];
  text: string;
  parent_text?: string;
}

export interface Document {
  filename: string;
  full_text: string;
  intra_sentential_relations: Node[];
}

export interface GroupedRelations {
  [signalType: string]: {
    [signalSubtype: string]: {
      [relationName: string]: number;
    };
  };
}

export interface RelationExample {
  document: string;
  relation: Node;
}
