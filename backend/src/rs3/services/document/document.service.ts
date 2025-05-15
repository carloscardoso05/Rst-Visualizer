import { RS3Document } from '@/rs3/models/document';
import { RS3Parser } from '@/rs3/models/RS3Parser';
import { DocumentCode, getDocumentCodeFromName, isValidDocumentCode, isValidDocumentName } from '@/rs3/util/document-util';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentService implements OnModuleInit {
    private readonly logger = new Logger(DocumentService.name);
    public readonly documents: RS3Document[] = [];
    readonly documentsPath = path.join(__dirname, '../../../documents').replace(/\\/g, '/');

    listFiles(code?: DocumentCode): string[] {
        this.logger.debug(`Searching for documents in ${this.documentsPath} with code: ${code}`);

        if (code && !isValidDocumentCode(code)) {
            throw new Error(`Invalid document code: ${code}`);
        }

        const pattern = path.join(this.documentsPath, '**', code ? `${code}_*` : '*').replace(/\\/g, '/');
        this.logger.debug(`Using pattern: ${pattern}`);

        try {
            const result = glob.sync(pattern).filter(file => fs.statSync(file).isFile() && file.endsWith('rs3'));
            this.logger.debug(`Found ${result.length} documents matching the pattern. \n${result.join('\n')}`);
            return result;
        } catch (error) {
            this.logger.error(`Error while searching documents: ${error.message}`);
            throw new Error('Error while listing documents');
        }
    }

    async listDocuments(code?: DocumentCode): Promise<RS3Document[]> {
        const files = this.listFiles(code);
        const documents: RS3Document[] = await Promise.all(
            files.map(async (file) => new RS3Parser(file).toRS3Document())
        );
        return documents;
    }

    async onModuleInit() {
        this.logger.debug('Initializing DocumentService and loading documents...');
        this.documents.push(...(await this.listDocuments()));
        this.logger.debug(`Loaded ${this.documents.length} documents.`);
    }
}
