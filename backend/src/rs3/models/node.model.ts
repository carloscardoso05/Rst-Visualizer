import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Relation } from "./relation.model";
import { Signal } from "./signal.model";
import type { Segment } from "./segment.model";


@ObjectType({ isAbstract: true })
export abstract class Node {
    abstract get nodeType(): 'segment' | 'group';

    @Field(() => Int)
    id: number;

    @Field(() => Node, { nullable: true })
    parent?: Node;

    parentId?: number;

    @Field(() => Relation, { nullable: true })
    relation?: Relation;

    relationName?: string;

    @Field(() => [Signal], { defaultValue: [] })
    signals: Signal[] = [];

    @Field(() => [Node], { defaultValue: [] })
    children: Node[] = [];

    @Field(() => Boolean)
    get isMultinuclear(): boolean {
        return ['sequence', 'same-unit', 'list', 'contrast', 'joint', 'other-rel', undefined].includes(this.relation?.name);
    }

    get siblings(): Node[] {
        if (!this.parent) {
            return [];
        }
        return this.parent.children;
    }

    get siblingsOfSameRelation(): Node[] {
        return this.siblings.filter(sibling => sibling.relation?.name === this.relation?.name);
    }

    get isRoot(): boolean {
        return !this.parent;
    }

    get deepSegments(): Segment[] {
        const { Segment } = require('./segment.model');
        const segments: Segment[] = [];
        if (this.nodeType === 'segment') segments.push((this as unknown) as Segment);
        for (const child of this.children) {
            segments.push(...child.deepSegments);
        }
        return segments.sort((a, b) => a.order - b.order);
    }

    get tokens(): string[] {
        return this.deepSegments.flatMap(s => s.innerText.split(/\s+/).filter(Boolean));
    }

    @Field()
    get text(): string {
        return this.tokens.join(' ');
    }
}
