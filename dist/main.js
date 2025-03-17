"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    const config = new swagger_1.DocumentBuilder()
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
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
    }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableCors();
    await app.listen(1999);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map