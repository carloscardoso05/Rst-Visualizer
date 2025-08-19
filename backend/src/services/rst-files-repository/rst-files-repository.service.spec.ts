import { single } from 'src/utils/array-util';
import { RstFilesRepository } from './rst-files-repository.service';

describe('RstFilesRepository', () => {
  const rstFilesRepository = new RstFilesRepository();

  describe('findRs3Files', () => {
    it('should find 161 rst files', () => {
      const files = rstFilesRepository.findRs3Files();
      expect(files.length).toEqual(161);
      files.forEach((file) => expect(file).toMatch(/\.rs3$/));
    });

    it.each<string>(['d1_c1', 'D1_C1', 'd1_C1'])(
      'should find 4 rst files with code D1_C1',
      (code) => {
        const files = rstFilesRepository.findRs3FilesByCode(code);
        expect(files.length).toEqual(4);
      },
    );
  });

  describe('findFontFiles', () => {
    it('should find 140 font files', () => {
      const files = rstFilesRepository.findFontFiles();
      expect(files.length).toEqual(140);
      files.forEach((file) => expect(file).toMatch(/\.txt$/));
    });

    const codeRegex = new RegExp(/D\d+_C\d+/i);
    const codes = new Set(
      rstFilesRepository
        .findFontFiles()
        .map((file) => single(file.match(codeRegex)!)),
    );

    it.each<string>([...codes])(
      'should find one font file for each code',
      (code) => {
        expect(() => rstFilesRepository.findFontFileByCode(code)).not.toThrow();
      },
    );
  });
});
