import { Test, TestingModule } from '@nestjs/testing';
import { RstResolver } from './rst.resolver';

describe('RstResolver', () => {
  let resolver: RstResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RstResolver],
    }).compile();

    resolver = module.get<RstResolver>(RstResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
