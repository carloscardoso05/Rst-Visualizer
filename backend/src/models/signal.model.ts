import { Exclude } from 'class-transformer';
import { Node } from './node.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Signal {
  @Field()
  id: number;
  @Field()
  sourceNodeId: number;
  @Exclude()
  sourceNode: Node;
  @Field()
  type: string;
  @Field()
  subtype: string;
  @Field(() => [Int])
  tokensIndexes: number[];

  constructor(
    id: number,
    sourceNodeId: number,
    sourceNode: Node,
    type: string,
    subtype: string,
    tokensIndexes: number[],
  ) {
    this.id = id;
    this.sourceNodeId = sourceNodeId;
    this.sourceNode = sourceNode;
    this.type = type;
    this.subtype = subtype;
    this.tokensIndexes = tokensIndexes;
  }
}
