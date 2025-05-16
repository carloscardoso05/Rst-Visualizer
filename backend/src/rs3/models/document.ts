import { Field, ObjectType } from "@nestjs/graphql";
import { DocumentCode, DocumentName } from "../util/document-util";
import { Group } from "./group.model";
import { Node } from "./node.model";
import { Relation } from "./relation.model";
import { Segment } from "./segment.model";
import { Signal } from "./signal.model";

@ObjectType()
export class RS3Document {
    @Field(() => String)
    public code: DocumentCode;

    @Field(() => String)
    public name: DocumentName;

    @Field(() => String)
    public path: string;

    @Field(() => [Relation], { defaultValue: [] })
    public relations: Relation[] = [];

    @Field(() => [Segment], { defaultValue: [] })
    public segments: Segment[] = [];

    @Field(() => [Group], { defaultValue: [] })
    public groups: Group[] = [];

    @Field(() => [Signal], { defaultValue: [] })
    public signals: Signal[] = [];

    @Field(() => [Node])
    public get nodes(): Node[] {
        return [...this.segments, ...this.groups];
    }

    @Field(() => Node, { nullable: true })
    public get root(): Node | null {
        return this.nodes.find(node => node.isRoot) ?? null;
    }

    @Field(() => [Node], { defaultValue: [] })
    public intraSententialRelations: Node[] = [];
};