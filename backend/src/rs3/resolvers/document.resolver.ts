import { Logger } from '@nestjs/common';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import * as chardet from 'chardet';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { RS3Document } from '../models/document';
import { DocumentService } from '../services/document/document.service';
import { DocumentCode, DocumentName } from '../util/document-util';

@Resolver(() => RS3Document)
export class DocumentResolver {
    constructor(private readonly documentService: DocumentService) { }

    private readonly logger = new Logger(DocumentResolver.name);

    @Query(() => [RS3Document])
    async documents(
        @Args('code', { type: () => String, nullable: true, })
        code?: DocumentCode,
        @Args('name', { type: () => String, nullable: true, })
        name?: DocumentName,
        @Args('id', { type: () => Int, nullable: true, })
        id?: number,
    ): Promise<RS3Document[]> {
        return this.documentService.documents
            .filter(
                (doc) => !code || doc.code.toUpperCase() === code.toUpperCase(),
            ).filter(
                (doc) => !name || doc.name.toUpperCase() === name.toUpperCase(),
            )
            .filter(
                (doc) => !id || doc.id === id,
            )
            .sort((a, b) => a.code.localeCompare(b.code));
    }

    @ResolveField(() => String, { nullable: true })
    formattedText(@Parent() doc: RS3Document): string | null {
        const pattern = path.join(__dirname, '../../documents', '**', `*${doc.code}_*.txt`).replace(/\\/g, '/');
        this.logger.debug(`Searching for text files with pattern: ${pattern}`);

        try {
            const result = glob.sync(pattern).filter(file => fs.statSync(file).isFile());
            this.logger.debug(`Found text files: ${result}`);
            if (result.length > 1) {
                this.logger.error(`Expected one text file, but found ${result.length}`);
            } else if (result.length === 0) {
                return null;
            }
            const filePath = result[0];
            let encoding = chardet.detectFileSync(filePath)?.toLowerCase() ?? 'utf-8';
            const validEncodings = [
                'ascii',
                'utf8',
                'utf-8',
                'utf16le',
                'utf-16le',
                'ucs2',
                'ucs-2',
                'base64',
                'base64url',
                'latin1',
                'binary',
                'hex'
            ] as const;
            this.logger.debug(`Detected encoding: ${encoding}`);
            let validEncoding: typeof validEncodings[number] = encoding as typeof validEncodings[number];
            if (!validEncodings.includes(encoding as typeof validEncodings[number])) {
                validEncoding = 'utf-8';
            }
            const fileContent = fs.readFileSync(filePath, validEncoding);
            return fileContent.replaceAll(/\n/g, '<br>');
        } catch (error) {
            this.logger.error(`Error reading file: ${error}`);
            throw new Error('Error while listing documents', error);
        }
    }
}