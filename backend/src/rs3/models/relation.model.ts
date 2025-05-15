import { Field, ObjectType } from "@nestjs/graphql";
import { Node } from "./node.model";
import { IRelationData } from "./RS3Parser";


@ObjectType()
export class Relation {
    @Field()
    name: string;

    @Field()
    type: string;

    @Field(() => [Node], { defaultValue: [] })
    nodes: Node[];

    public static fromData(data: IRelationData): Relation {
        const relation = new Relation();
        relation.name = data['@_name'];
        relation.type = data['@_type'];
        return relation;
    }
}
