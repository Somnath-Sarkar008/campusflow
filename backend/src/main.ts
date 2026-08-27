import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser/server-to-server requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfiguredFrontend = origin === frontendUrl;
      const isCampusFlowVercelPreview =
        /^https:\/\/campusflow-[a-z0-9-]+\.vercel\.app$/i.test(origin);
      const isLocalhost = /^http:\/\/localhost:\d+$/i.test(origin);

      if (isConfiguredFrontend || isCampusFlowVercelPreview || isLocalhost) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
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
