import { DocumentService } from '@/rs3/services/document/document.service';
import { Module } from '@nestjs/common';
import { DocumentResolver } from './resolvers/document.resolver';

@Module({
    providers: [DocumentService, DocumentResolver],
})
export class Rs3Module {}
