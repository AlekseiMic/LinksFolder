import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'app.module';
import { initValidators } from 'init-validators';

const isDev = process.env['NODE_ENV'] === 'development';

console.log(process.env['NODE_ENV']);
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: isDev
        ? ['http://localhost:4200']
        : ['http://link-folder.ru', 'https://link-folder.ru'],
      allowedHeaders: ['set-cookie', 'authorization', 'content-type'],
      credentials: true,
    },
  });

  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api');

  initValidators();

  const port = process.env['PORT'] || 3333;
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
