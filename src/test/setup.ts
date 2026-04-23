import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaClient } from '@prisma/client';
import { TestFactory } from './test-factory';
import { JwtService } from '@nestjs/jwt';

describe('Test Setup', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let testFactory: TestFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaClient>(PrismaClient);
    testFactory = new TestFactory(prisma);
    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  return { app, prisma, testFactory, jwtService };
});

export { app, prisma, testFactory, jwtService };
