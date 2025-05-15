import { DocumentService } from '@/rs3/services/document/document.service';
import { Module } from '@nestjs/common';
import { RelationResolver } from './resolvers/relation.resolver';
import { DocumentResolver } from './resolvers/document.resolver';

@Module({
    providers: [DocumentService, RelationResolver, DocumentResolver],
})
export class Rs3Module {}
