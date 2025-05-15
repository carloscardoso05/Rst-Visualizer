import { Query, Resolver } from "@nestjs/graphql";
import { Relation } from "../models/relation.model";

@Resolver(() => Relation)
export class RelationResolver {
  @Query(() => Relation)
  async relation(): Promise<Relation> {
    return new Relation();
  }
}