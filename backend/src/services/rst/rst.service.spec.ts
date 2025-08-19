import { Test, TestingModule } from '@nestjs/testing';
import { RstFilesRepository } from '../rst-files-repository/rst-files-repository.service';
import { RstService } from './rst.service';

describe('RstService', () => {
  let service: RstService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RstService, RstFilesRepository],
    }).compile();

    await module.init();
    service = module.get<RstService>(RstService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRstDocuments', () => {
    it.each([
      { code: '', qtd: 161 },
      { code: undefined, qtd: 161 },
      { code: ' ', qtd: 0 },
      { code: 'd1_c1', qtd: 4 },
    ])('should have $qtd Rst for code $code', ({ code, qtd }) => {
      const documents = service.getRstDocuments(code);
      expect(documents.length).toEqual(qtd);
    });
  });
});
