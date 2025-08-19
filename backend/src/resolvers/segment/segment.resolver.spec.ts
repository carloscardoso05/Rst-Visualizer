import { Test, TestingModule } from '@nestjs/testing';
import { SegmentResolver } from './segment.resolver';

describe('SegmentResolver', () => {
  let resolver: SegmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SegmentResolver],
    }).compile();

    resolver = module.get<SegmentResolver>(SegmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
