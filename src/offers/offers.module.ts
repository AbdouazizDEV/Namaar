// src/offers/offers.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { FavorisModule } from '../favoris/favoris.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offre.name, schema: OffreSchema },
      { name: Voiture.name, schema: VoitureSchema },
    ]),
    forwardRef(() => FavorisModule), // Importer FavorisModule avec forwardRef
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService], // Exporter OffersService pour l'utiliser dans d'autres modules
})
export class OffersModule {}
