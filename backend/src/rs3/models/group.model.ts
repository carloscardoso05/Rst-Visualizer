import { ObjectType, Field } from "@nestjs/graphql";
import { Node } from "./node.model";
import { IGroupData } from "./RS3Parser";


@ObjectType()
export class Group extends Node {
    get nodeType(): "segment" | "group" {
        return 'group';
    }

    @Field()
    type: string;

    public static fromData(data: IGroupData): Group {
        const group = new Group();
        group.id = parseInt(data['@_id'], 10);
        group.parentId = data['@_parent'] ? parseInt(data['@_parent'], 10) : undefined;
        group.relationName = data['@_relname'] ?? undefined;
        group.type = data['@_type'];
        return group;
    }
}
