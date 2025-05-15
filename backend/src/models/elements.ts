import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Node {
    id: number;
    parentId: number | null = null;
    relname: string | null = null;
    signals: Signal[] = [];
}

@ObjectType()
export class Segment extends Node {
    order: number;
    innerText: string;
    initialTokenId: number ;
    sentenceId: number;
}

@ObjectType()
export class Group extends Node {
    type: string;
}

@ObjectType()
export class Signal {
    id: number;
    sourceId: number;
    type: string;
    subtype: string;
    tokensIds: number[] = [];
}

@ObjectType()
export class Relation {
    name: string;
    type: string;
}