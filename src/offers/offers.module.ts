// src/offers/offers.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offre.name, schema: OffreSchema },
      { name: Voiture.name, schema: VoitureSchema },
    ]),
  ],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
