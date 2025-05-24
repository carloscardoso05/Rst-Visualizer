import { ObjectType, Field, Int } from "@nestjs/graphql";
import { ISegmentData } from "./RS3Parser";
import { Node } from "./node.model";
import { TokenId } from "./token-id.model";


@ObjectType()
export class Segment extends Node {
    get nodeType(): "segment" | "group" {
        return "segment";
    }

    // _tokensIds: TokenId[] = [];

    @Field(() => Int)
    order: number;

    @Field()
    innerText: string;


    @Field(() => [TokenId])
    get innterTokensIds(): TokenId[] {
        return this.innerText
            .split(/\s/)
            .map(
                (token, index) => new TokenId(this.initialTokenId + index, token),
            );
    }

    _initialTokenId: number;

    @Field(() => Int)
    sentenceId: number;

    public static fromData(data: ISegmentData, order: number): Segment {
        const segment = new Segment();
        segment.id = parseInt(data['@_id'], 10);
        segment.parentId = data['@_parent'] ? parseInt(data['@_parent'], 10) : undefined;
        segment.relationName = data['@_relname'] ?? undefined;
        segment.order = order;
        segment.innerText = data['#text']?.trim() ?? '';
        return segment;
    }
}
