// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import {
  LocationContrat,
  LocationContratSchema,
} from '../schemas/location.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Client, ClientSchema } from '../schemas/client.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Facture, FactureSchema } from '../schemas/facture.schema';
import { Paiement, PaiementSchema } from '../schemas/paiement.schema';
import { Alerte, AlerteSchema } from '../schemas/alerte.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: LocationContrat.name, schema: LocationContratSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
      { name: Facture.name, schema: FactureSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: Alerte.name, schema: AlerteSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
