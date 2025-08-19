import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Relation {
  @Field()
  name: string;
  @Field()
  type: string;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  equals(other: Relation): boolean {
    return this.name === other.name;
  }

  toString(): string {
    return this.name;
  }
}
