import { Test, TestingModule } from '@nestjs/testing';
import { CharacteristicsController } from './characteristics.controller';
import { CharacteristicsService } from './characteristics.service';

describe('CharacteristicsController', () => {
  let controller: CharacteristicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharacteristicsController],
      providers: [CharacteristicsService],
    }).compile();

    controller = module.get<CharacteristicsController>(CharacteristicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
