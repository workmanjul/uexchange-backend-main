import { Test, TestingModule } from '@nestjs/testing';
import { OfficeLocationController } from './office_location.controller';
import { OfficeLocationService } from './office_location.service';

describe('OfficeLocationController', () => {
  let controller: OfficeLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficeLocationController],
      providers: [OfficeLocationService],
    }).compile();

    controller = module.get<OfficeLocationController>(OfficeLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
