import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Activer la validation des DTO
  app.useGlobalPipes(new ValidationPipe());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('NDAMAAR API')
    .setDescription('API de location de véhicules NDAMAAR')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('vehicles', 'Gestion des véhicules')
    .addTag('reservations', 'Gestion des réservations')
    .addTag('clients', 'Gestion des clients')
    .addTag('offers', 'Gestion des offres spéciales')
    .addTag('locations', 'Gestion des contrats de location')
    .addTag('dashboard', 'Statistiques et tableaux de bord')
    .addTag('public', 'Endpoints publics')
    .addTag('favoris', 'Gestion des favoris')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Middleware pour gérer les CORS si nécessaire
  app.enableCors();

  await app.listen(1999);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
  );
}
bootstrap();
