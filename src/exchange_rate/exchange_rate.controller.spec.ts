import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateController } from './exchange_rate.controller';
import { ExchangeRateService } from './exchange_rate.service';

describe('ExchangeRateController', () => {
  let controller: ExchangeRateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeRateController],
      providers: [ExchangeRateService],
    }).compile();

    controller = module.get<ExchangeRateController>(ExchangeRateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
