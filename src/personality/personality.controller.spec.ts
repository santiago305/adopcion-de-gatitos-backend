import { Test, TestingModule } from '@nestjs/testing';
import { PersonalityController } from './personality.controller';
import { PersonalityService } from './personality.service';

describe('PersonalityController', () => {
  let controller: PersonalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalityController],
      providers: [PersonalityService],
    }).compile();

    controller = module.get<PersonalityController>(PersonalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
