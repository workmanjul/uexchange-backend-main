import { Test, TestingModule } from '@nestjs/testing';
import { OnholdController } from './onhold.controller';
import { OnholdService } from './onhold.service';

describe('OnholdController', () => {
  let controller: OnholdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnholdController],
      providers: [OnholdService],
    }).compile();

    controller = module.get<OnholdController>(OnholdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
