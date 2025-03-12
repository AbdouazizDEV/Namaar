import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Activer la validation des DTO
  app.useGlobalPipes(new ValidationPipe());

  // Middleware pour gérer les CORS si nécessaire
  app.enableCors();

  await app.listen(1999);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
