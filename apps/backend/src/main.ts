/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:4200'],
      allowedHeaders: ['set-cookie', 'authorization', 'content-type'],
      credentials: true,
    },
  });
  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const port = process.env['PORT'] || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
}

bootstrap();
