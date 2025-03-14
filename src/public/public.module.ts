// src/public/public.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Image, ImageSchema } from '../schemas/image.schema';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Voiture.name, schema: VoitureSchema },
      { name: Image.name, schema: ImageSchema },
      { name: Offre.name, schema: OffreSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
