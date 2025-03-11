import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* await app.listen(process.env.PORT ?? 3000); */
  await app.listen(1999);
}
bootstrap();
