import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Group } from './group.model';
import { Relation } from './relation.model';
import type { Segment } from './segment.model';
import { Signal } from './signal.model';
import { TokenId } from './token-id.model';

@ObjectType({ isAbstract: true })
export abstract class Node {
    abstract get nodeType(): 'segment' | 'group';

    @Field(() => Int)
    get initialTokenId(): number {
        if (Node.isSegment(this)) {
            return this._initialTokenId;
        }
        return this.subtreeSegments.reduce(
            (smallest, segment) =>
                !smallest || segment.initialTokenId < smallest
                    ? segment._initialTokenId
                    : smallest,
            Number.POSITIVE_INFINITY,
        );
    }

    @Field(() => [TokenId])
    get tokensIds(): TokenId[] {
        return this.text
            .split(/\s/)
            .map(
                (token, index) => new TokenId(this.initialTokenId + index, token),
            );
    }

    static isSegment(node: Node): node is Segment {
        return node.nodeType === 'segment';
    }

    static isGroup(node: Node): node is Group {
        return node.nodeType === 'group';
    }

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
        return [
            'sequence',
            'same-unit',
            'list',
            'contrast',
            'joint',
            'other-rel',
            undefined,
        ].includes(this.relation?.name);
    }

    get siblings(): Node[] {
        if (!this.parent) {
            return [];
        }
        return this.parent.children;
    }

    get siblingsOfSameRelation(): Node[] {
        return this.siblings.filter(
            (sibling) => sibling.relation?.name === this.relation?.name,
        );
    }

    get isRoot(): boolean {
        return !this.parent;
    }

    get subtreeSegments(): Segment[] {
        const segments: Segment[] = [];
        if (Node.isSegment(this)) segments.push(this);
        for (const child of this.children) {
            segments.push(...child.subtreeSegments);
        }
        return segments.sort((a, b) => a.order - b.order);
    }

    get subtreeSegmentsTexts(): string[] {
        return this.subtreeSegments.flatMap((s) =>
            s.innerText.split(/\s/),
        );
    }

    @Field()
    get text(): string {
        return this.subtreeSegmentsTexts.join(' ');
    }
}
