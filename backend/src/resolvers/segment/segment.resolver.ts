import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Segment } from 'src/models';
import { TokenId } from 'src/models/tokenId.model';

@Resolver(() => Segment)
export class SegmentResolver {
  @ResolveField(() => [TokenId])
  tokensById(@Parent() segment: Segment) {
    return [...segment.getTokensDict().entries()]
      .map(([id, token]) => new TokenId(id, token))
      .sort((a, b) => a.id - b.id);
  }
}
