import { Resolver, Query } from "@nestjs/graphql";
import { RS3Document } from "../models/document";
import { DocumentService } from "../services/document/document.service";

@Resolver(() => RS3Document)
export class DocumentResolver {
    constructor(
        private readonly documentService: DocumentService
    ) { }

    @Query(() => [RS3Document])
    async documents(): Promise<RS3Document[]> {
        return this.documentService.documents;
    }
}