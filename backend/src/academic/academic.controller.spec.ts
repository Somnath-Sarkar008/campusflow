import { Test, TestingModule } from '@nestjs/testing';
import { AcademicController } from './academic.controller';

describe('AcademicController', () => {
  let controller: AcademicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicController],
    }).compile();

    controller = module.get<AcademicController>(AcademicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
