import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Node } from "./node.model";
import { ISignalData, RS3Parser } from "./RS3Parser";


@ObjectType()
export class Signal {
    parser: RS3Parser;

    @Field(() => Int)
    id: number;

    @Field(() => Node)
    source: Node;

    sourceId: number;

    @Field()
    type: string;

    @Field()
    subtype: string;

    @Field(() => [Int], { defaultValue: [] })
    tokensIds: number[] = [];

    @Field(() => [String])
    get tokens(): string[] {
        const dict = this.parser.getTokensDict();
        return this.tokensIds.sort((a, b) => a - b).map(i => dict.get(i)).filter((t): t is string => !!t)
    }

    @Field()
    get text(): string {
        return this.tokens.join(' ');
    }

    public static fromData(data: ISignalData, index: number): Signal {
        const signal = new Signal();
        signal.id = index;
        signal.sourceId = parseInt(data['@_source'], 10);
        signal.type = data['@_type'];
        signal.subtype = data['@_subtype'];
        signal.tokensIds = data['@_tokens']
            ? data['@_tokens'].split(',').map(t => parseInt(t, 10))
            : [];
        return signal;
    }
}
