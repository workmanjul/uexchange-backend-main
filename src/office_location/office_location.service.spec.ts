import { Test, TestingModule } from '@nestjs/testing';
import { OfficeLocationService } from './office_location.service';

describe('OfficeLocationService', () => {
  let service: OfficeLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfficeLocationService],
    }).compile();

    service = module.get<OfficeLocationService>(OfficeLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
