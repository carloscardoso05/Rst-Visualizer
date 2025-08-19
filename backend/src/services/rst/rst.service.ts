import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { RstFilesRepository } from '../rst-files-repository/rst-files-repository.service';
import { Rst } from 'src/models';

@Injectable()
export class RstService implements OnModuleInit {
  constructor(private readonly filesRepository: RstFilesRepository) {}

  private readonly rstDocuments: Rst[] = [];

  async onModuleInit() {
    const files = this.filesRepository.findRs3Files();
    const rsts = files.map((file, index) => new Rst(index, file));
    await Promise.all(rsts.map((rst) => rst.initialize()));
    this.rstDocuments.push(...rsts);
  }

  public getRstDocuments(code?: string): Rst[] {
    return this.rstDocuments.filter(
      (rst) => !code || rst.code.toUpperCase() === code.toUpperCase(),
    );
  }

  public getRstDocumentById(id: number): Rst {
    const rst = this.rstDocuments.at(id);
    if (!rst)
      throw new HttpException(
        `Document with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    return rst;
  }
}
