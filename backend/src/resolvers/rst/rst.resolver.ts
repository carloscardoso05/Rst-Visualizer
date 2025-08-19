import getFileInfo from 'detect-file-encoding-and-language';
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { readFileSync } from 'fs';
import { Group, Node, Rst, Segment } from 'src/models';
import { RstFilesRepository } from 'src/services/rst-files-repository/rst-files-repository.service';
import { RstService } from 'src/services/rst/rst.service';

@Resolver(() => Rst)
export class RstResolver {
  constructor(
    private readonly rstService: RstService,
    private readonly filesRepository: RstFilesRepository,
  ) {}

  @Query(() => [Rst])
  rst(
    @Args('id', { nullable: true, type: () => Int }) id?: number,
    @Args('code', { nullable: true }) code?: string,
  ): Rst[] {
    return this.rstService
      .getRstDocuments(code)
      .filter((rst) => id === undefined || rst.id === id);
  }

  @ResolveField(() => [Segment])
  segments(
    @Parent() rst: Rst,
    @Args('intraSententialRelation', {
      type: () => Boolean,
      defaultValue: false,
    })
    intraSententialRelation: boolean,
    @Args('type', {
      type: () => String,
      nullable: true,
    })
    type?: string,
    @Args('subtype', {
      type: () => String,
      nullable: true,
    })
    subtype?: string,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ): Segment[] {
    const segments = [...rst.root.getSubtree().values()].filter(
      (node) => node instanceof Segment,
    );
    return segments.filter(
      (node) =>
        (id === undefined || node.id === id) &&
        (!intraSententialRelation || Node.hasIntraSententialRelation(node)),
    );
  }

  @ResolveField(() => [Group])
  groups(
    @Parent() rst: Rst,
    @Args('intraSententialRelation', {
      type: () => Boolean,
      defaultValue: false,
    })
    intraSententialRelation: boolean,
    @Args('type', {
      type: () => String,
      nullable: true,
    })
    type?: string,
    @Args('subtype', {
      type: () => String,
      nullable: true,
    })
    subtype?: string,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ): Group[] {
    const groups = [...rst.root.getSubtree().values()].filter(
      (node) => node instanceof Group,
    );
    return groups.filter(
      (node) =>
        (id === undefined || node.id === id) &&
        (!intraSententialRelation || Node.hasIntraSententialRelation(node)),
    );
  }

  @ResolveField(() => String)
  text(
    @Parent() rst: Rst,
    @Args('limitWords', { type: () => Int, nullable: true })
    limitWords?: number,
  ): string {
    const text = rst.root.getText();
    return text
      .split(' ')
      .slice(0, limitWords || -1)
      .join(' ')
      .concat(limitWords ? '...' : '');
  }

  @ResolveField(() => [Int])
  nodesIdsWithIntraSententialRelations(@Parent() rst: Rst): number[] {
    return rst.root
      .getNodesWithIntraSententialRelations()
      .map((node) => node.id);
  }

  @ResolveField(() => String)
  async fontText(@Parent() rst: Rst): Promise<string> {
    const fontFile = this.filesRepository.findFontFileByCode(rst.code);
    return readFileSync(
      fontFile,
      (await getFileInfo(fontFile)).encoding as BufferEncoding,
    );
  }
}
