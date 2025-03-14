// src/locations/locations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import {
  LocationContrat,
  LocationContratSchema,
} from '../schemas/location.schema';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Facture, FactureSchema } from '../schemas/facture.schema';
import { Paiement, PaiementSchema } from '../schemas/paiement.schema';
import { Client, ClientSchema } from '../schemas/client.schema';
import { MailService } from './mail.service';
import { PdfService } from './pdf.service';
import { Offre, OffreSchema } from '../schemas/offre.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LocationContrat.name, schema: LocationContratSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: User.name, schema: UserSchema },
      { name: Facture.name, schema: FactureSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Offre.name, schema: OffreSchema },
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, MailService, PdfService],
})
export class LocationsModule {}
