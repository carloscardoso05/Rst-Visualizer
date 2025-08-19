import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenId {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  token: string;

  constructor(id: number, token: string) {
    this.id = id;
    this.token = token;
  }
}
