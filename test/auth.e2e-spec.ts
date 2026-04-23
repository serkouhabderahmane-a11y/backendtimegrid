import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SeedService } from '../src/modules/seed/seed.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let demoUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    await app.init();
    
    // Seed demo users
    process.env.SEED_DEMO = 'true';
    const seedService = app.get(SeedService);
    await seedService.seedDemoUsers();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api should return status ok', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('service');
        });
    });
  });

  describe('Demo Credentials', () => {
    it('GET /api/auth/demo should return demo accounts', () => {
      return request(app.getHttpServer())
        .get('/api/auth/demo')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('demo', true);
          expect(res.body).toHaveProperty('accounts');
          expect(Array.isArray(res.body.accounts)).toBe(true);
          expect(res.body.accounts.length).toBeGreaterThan(0);
          
          const adminAccount = res.body.accounts.find((a: any) => a.role === 'admin');
          expect(adminAccount).toBeDefined();
          console.log('Demo accounts found:', res.body.accounts);
        });
    });
  });

  describe('Login Flow', () => {
    it('POST /api/auth/login with valid credentials should return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'demo@timegrid.app',
          password: 'demo123',
        });

      console.log('Login response status:', response.status);
      console.log('Login response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');

      accessToken = response.body.token;
    });

    it('POST /api/auth/login with invalid credentials should fail', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'demo@timegrid.app',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('POST /api/auth/login with missing fields should fail', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'demo@timegrid.app',
        })
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    it('GET /api/auth/me without token should return 401', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('GET /api/auth/me with valid token should return user', async () => {
      if (!accessToken) {
        console.log('Skipping - no access token');
        return;
      }

      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          console.log('User data:', res.body);
        });
    });
  });
});
