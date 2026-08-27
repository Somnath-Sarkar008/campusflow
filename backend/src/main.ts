import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (health checks, server-to-server calls).
      if (!origin) return callback(null, true);

      const isConfiguredOrigin = origin === frontendUrl;
      const isCampusFlowVercelPreview = /^https:\/\/campusflow-[a-z0-9-]+\.vercel\.app$/i.test(origin);
      const isLocalDevelopment = /^http:\/\/(localhost|127\.0\.0\.1):(3000|3001)$/i.test(origin);

      if (isConfiguredOrigin || isCampusFlowVercelPreview || isLocalDevelopment) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
