import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppService } from './app.service';
import { RstResolver } from './resolvers/rst/rst.resolver';
import { RstFilesRepository } from './services/rst-files-repository/rst-files-repository.service';
import { RstService } from './services/rst/rst.service';
import { GroupResolver } from './resolvers/group/group.resolver';
import { SegmentResolver } from './resolvers/segment/segment.resolver';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
  controllers: [],
  providers: [
    AppService,
    RstFilesRepository,
    RstService,
    RstResolver,
    GroupResolver,
    SegmentResolver,
  ],
})
export class AppModule {}
