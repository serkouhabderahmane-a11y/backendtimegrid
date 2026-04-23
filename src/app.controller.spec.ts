import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('timegrid-backend');
    });
  });

  describe('healthCheck', () => {
    it('should return detailed health check', () => {
      const result = appController.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.uptime).toBeDefined();
      expect(result.memory).toBeDefined();
    });
  });
});
