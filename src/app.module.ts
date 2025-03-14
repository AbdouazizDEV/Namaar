// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { Client, ClientSchema } from './schemas/client.schema';
import { Voiture, VoitureSchema } from './schemas/voiture.schema';
import { Offre, OffreSchema } from './schemas/offre.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { Facture, FactureSchema } from './schemas/facture.schema';
import { Paiement, PaiementSchema } from './schemas/paiement.schema';
import {
  FavoriVoiture,
  FavoriVoitureSchema,
  FavoriOffre,
  FavoriOffreSchema,
} from './schemas/favori.schema';
import {
  Authentification,
  AuthentificationSchema,
} from './schemas/authentification.schema';
import {
  LocationContrat,
  LocationContratSchema,
} from './schemas/location.schema';
import { Image, ImageSchema } from './schemas/image.schema';
import { Alerte, AlerteSchema } from './schemas/alerte.schema';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OffersModule } from './offers/offers.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ClientsModule } from './clients/clients.module';
import { LocationsModule } from './locations/locations.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}/${configService.get('DB_NAME')}`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: Offre.name, schema: OffreSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Facture.name, schema: FactureSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: FavoriVoiture.name, schema: FavoriVoitureSchema },
      { name: FavoriOffre.name, schema: FavoriOffreSchema },
      { name: Authentification.name, schema: AuthentificationSchema },
      { name: LocationContrat.name, schema: LocationContratSchema },
      { name: Image.name, schema: ImageSchema },
      { name: Alerte.name, schema: AlerteSchema },
    ]),
    AuthModule,
    CloudinaryModule,
    VehiclesModule,
    OffersModule,
    ReservationsModule,
    ClientsModule,
    LocationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
