import { Test, TestingModule } from '@nestjs/testing';
import { WholesaleService } from './wholesale.service';

describe('WholesaleService', () => {
  let service: WholesaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WholesaleService],
    }).compile();

    service = module.get<WholesaleService>(WholesaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
