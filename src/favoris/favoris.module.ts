// src/favoris/favoris.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavorisController } from './favoris.controller';
import { FavorisService } from './favoris.service';
import { FavoriVoiture, FavoriVoitureSchema } from '../schemas/favori.schema';
import { FavoriOffre, FavoriOffreSchema } from '../schemas/favori.schema';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { OffersModule } from '../offers/offers.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FavoriVoiture.name, schema: FavoriVoitureSchema },
      { name: FavoriOffre.name, schema: FavoriOffreSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: Offre.name, schema: OffreSchema },
    ]),
    forwardRef(() => OffersModule), // Importer OffersModule avec forwardRef
    forwardRef(() => VehiclesModule), // Importer VehiclesModule avec forwardRef
  ],
  controllers: [FavorisController],
  providers: [FavorisService],
  exports: [FavorisService],
})
export class FavorisModule {}
