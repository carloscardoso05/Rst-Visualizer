import { Resolver, Query, Args } from '@nestjs/graphql';
import { RS3Document } from '../models/document';
import { DocumentService } from '../services/document/document.service';
import { DocumentCode, DocumentName } from '../util/document-util';

@Resolver(() => RS3Document)
export class DocumentResolver {
    constructor(private readonly documentService: DocumentService) { }

    @Query(() => [RS3Document])
    async documents(
        @Args('code', { type: () => String, nullable: true, })
        code?: DocumentCode,
        @Args('name', { type: () => String, nullable: true, })
        name?: DocumentName,
    ): Promise<RS3Document[]> {
        return this.documentService.documents.filter(
            (doc) => !code || doc.code.toUpperCase() === code.toUpperCase(),
        ).filter(
            (doc) => !name || doc.name.toUpperCase() === name.toUpperCase(),
        );
    }
}