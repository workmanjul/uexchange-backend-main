import { Test, TestingModule } from '@nestjs/testing';
import { PaginationController } from './pagination.controller';

describe('PaginationController', () => {
  let controller: PaginationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaginationController],
    }).compile();

    controller = module.get<PaginationController>(PaginationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
