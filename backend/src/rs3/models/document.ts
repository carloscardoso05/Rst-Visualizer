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

    @Field(() => Node)
    public get root(): Node {
        const root = this.nodes.find(node => node.isRoot);
        if (!root) {
            throw new Error("Root node not found");
        }
        return root;
    }

    @Field(() => [Node], { defaultValue: [] })
    public intraSententialRelations: Node[] = [];
};