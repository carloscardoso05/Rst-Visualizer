import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { singleWhere } from 'src/utils/array-util';

export interface ProcessingResult {
  fileName: string;
  relationCounts: Map<string, number>;
}

export interface AnalysisResult {
  processedFiles: number;
  results: ProcessingResult[];
  allRelations: string[];
  outputPath: string;
}

@Injectable()
export class RstFilesRepository implements OnModuleInit {
  readonly documentsDir = path.join(__dirname, '../../assets/documents');
  readonly rs3Pattern = `${this.documentsDir}/**/*.rs3`;
  readonly fontFilePattern = `${this.documentsDir}/**/*.txt`;
  private readonly logger = new Logger(RstFilesRepository.name);

  onModuleInit() {
    this.logger.debug(`documentsDir: ${this.documentsDir}`);
    this.logger.debug(`pattern: ${this.rs3Pattern}`);
    this.logger.debug(`${this.findRs3Files().length} files were found`);
  }

  public findRs3Files(): string[] {
    return fs.globSync(this.rs3Pattern);
  }

  public findRs3FilesByCode(code: string): string[] {
    const files = this.findRs3Files();
    const regex = new RegExp(`${code}\\D`, 'i');
    return files.filter((file) => file.match(regex));
  }

  public findFontFiles(): string[] {
    return fs.globSync(this.fontFilePattern);
  }

  public findFontFileByCode(code: string): string {
    const files = this.findFontFiles();
    const regex = new RegExp(`${code}\\D`, 'i');
    return singleWhere(files, (file) => file.match(regex));
  }
}
