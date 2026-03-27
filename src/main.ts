import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://timegrid-frontend.vercel.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.APP_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  if (process.env.SEED_DEMO === 'true') {
    try {
      const seedService = app.get(SeedService);
      await seedService.seedDemoUsers();
      console.log('[Seed] Demo users seeded successfully');
    } catch (error) {
      console.error('[Seed] Error seeding demo users:', error.message);
    }
  }

  const port = process.env.PORT || process.env.VERCEL_PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port: ${port}`);
}
bootstrap();
