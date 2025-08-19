import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Group } from 'src/models';
import { TokenId } from 'src/models/tokenId.model';

@Resolver(() => Group)
export class GroupResolver {
  @ResolveField(() => [TokenId])
  tokensById(@Parent() group: Group) {
    return [...group.getTokensDict().entries()]
      .map(([id, token]) => new TokenId(id, token))
      .sort((a, b) => a.id - b.id);
  }
}
