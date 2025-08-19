import { Exclude } from 'class-transformer';
import { Relation } from './relation.model';
import { Signal } from './signal.model';
import { singleWhere } from 'src/utils/array-util';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class Node {
  @Field()
  id: number;
  @Field(() => Relation, { nullable: true })
  relation: Relation | undefined;
  @Field(() => Int, { nullable: true })
  parentId: number | undefined;
  @Exclude()
  parent: Node | undefined;
  @Exclude()
  children: Node[] = [];
  @Field(() => [Signal])
  signals: Signal[] = [];

  constructor(
    id: number,
    relation: Relation | undefined,
    parentId: number | undefined,
  ) {
    this.id = id;
    this.relation = relation;
    this.parentId = parentId;
  }

  abstract get order(): number;

  abstract getTokensDict(): Map<number, string>;

  getRoot(): Node {
    return this.parent ? this.parent.getRoot() : this;
  }

  public getSubtree(): Set<Node> {
    let nodes = new Set<Node>([this]);
    this.children.forEach((child) => {
      nodes = new Set<Node>([...nodes, ...child.getSubtree()]);
    });
    return nodes;
  }

  private getSubtreeSegments(): Set<Segment> {
    const segments = new Set<Segment>();
    if (this instanceof Segment) {
      segments.add(this);
    }
    for (const child of this.children) {
      const childSegments = child.getSubtreeSegments();
      childSegments.forEach((segment) => segments.add(segment));
    }
    return segments;
  }

  getSubtreeSegmentsOrdered(): Segment[] {
    const segments = Array.from(this.getSubtreeSegments());
    return segments.sort((a, b) => a.order - b.order);
  }

  private getSubtreeNodes(): Set<Node> {
    const nodes = new Set<Node>([this]);
    for (const child of this.children) {
      const childNodes = child.getSubtreeNodes();
      childNodes.forEach((node) => nodes.add(node));
    }
    return nodes;
  }

  getNodesWithIntraSententialRelations(): Node[] {
    return Array.from(this.getSubtreeNodes()).filter((node) =>
      Node.hasIntraSententialRelation(node),
    );
  }

  getIntraSententialRelationsCount(): Map<string, number> {
    const counts = new Map<string, number>();
    const nodes = this.getNodesWithIntraSententialRelations();

    for (const node of nodes) {
      if (node.relation) {
        const relationName = node.relation.name;
        counts.set(relationName, (counts.get(relationName) || 0) + 1);
      }
    }

    return counts;
  }

  isMultinuclear(): boolean {
    return (
      !this.relation ||
      [
        'sequence',
        'same-unit',
        'list',
        'contrast',
        'joint',
        'other-rel',
      ].includes(this.relation.name)
    );
  }

  subtreeContainsOnlyOneSentence(): boolean {
    const segments = this.getSubtreeSegmentsOrdered();
    if (segments.length === 0) return true;
    const firstSentenceId = segments[0].sentenceId;
    return segments.every((segment) => segment.sentenceId === firstSentenceId);
  }

  getSiblings(): Node[] {
    return this.parent ? this.parent.children : [];
  }

  getSiblingsOfSameRelation(): Node[] {
    return this.getSiblings().filter(
      (sibling) => sibling.relation?.name === this.relation?.name,
    );
  }

  getText(): string {
    return this.getSubtreeSegmentsOrdered()
      .map((segment) => segment.innerText)
      .join(' ');
  }

  getNode(id: number): Node | undefined {
    if (this.id === id) return this;
    if (!this.children) return undefined;
    return singleWhere(
      this.children.map((child) => child.getNode(id)),
      (node) => node,
    );
  }

  static hasIntraSententialRelation(node: Node): boolean {
    if (!node.relation || node.relation.name === 'span') {
      return false;
    }

    if (node.isMultinuclear()) {
      const siblings = node.getSiblingsOfSameRelation();
      if (node.relation.name === 'same-unit') {
        return siblings[0].id === node.id;
      }
      const index = siblings.findIndex((sibling) => sibling.id === node.id);
      if (index + 1 === siblings.length) {
        return false;
      }
    }

    return node.subtreeContainsOnlyOneSentence();
  }
}

@ObjectType()
export class Segment extends Node {
  @Field(() => Int)
  order: number;
  @Field(() => String)
  innerText: string;

  @Field(() => Int)
  sentenceId: number = 0;
  @Field(() => Int)
  initialTokenId: number = 0;

  constructor(
    id: number,
    relation: Relation,
    parentId: number,
    innerText: string,
    order: number,
  ) {
    super(id, relation, parentId);
    this.innerText = innerText;
    this.order = order;
  }

  getTokensDict(): Map<number, string> {
    const tokens = this.innerText.split(' ');
    const tokensDict = new Map<number, string>();
    tokens.forEach((token, index) => {
      tokensDict.set(this.initialTokenId + index, token);
    });
    return tokensDict;
  }
}

@ObjectType()
export class Group extends Node {
  @Field(() => String)
  type: string;

  constructor(
    id: number,
    relation: Relation | undefined,
    parentId: number | undefined,
    type: string,
  ) {
    super(id, relation, parentId);
    this.type = type;
  }

  @Field(() => Int)
  get order(): number {
    const segments = this.getSubtreeSegmentsOrdered();
    return segments.length > 0 ? Math.min(...segments.map((s) => s.order)) : 0;
  }

  getTokensDict(): Map<number, string> {
    const tokens = new Map<number, string>();
    const segments = this.getSubtreeSegmentsOrdered();
    segments.forEach((segment) =>
      segment.getTokensDict().forEach((token, id) => tokens.set(id, token)),
    );
    return tokens;
  }

  static fromObj(
    obj: { '@id': string; '@parent'?: string; '@type': string },
    relation: Relation | undefined,
  ): Group {
    return new Group(
      parseInt(obj['@id']),
      relation,
      obj['@parent'] ? parseInt(obj['@parent']) : undefined,
      obj['@type'],
    );
  }
}
