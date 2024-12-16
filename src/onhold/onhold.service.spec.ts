import { Test, TestingModule } from '@nestjs/testing';
import { OnholdService } from './onhold.service';

describe('OnholdService', () => {
  let service: OnholdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnholdService],
    }).compile();

    service = module.get<OnholdService>(OnholdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
