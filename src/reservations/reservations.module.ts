// src/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { OptionSupplementaire, OptionSupplementaireSchema } from '../schemas/option-supplementaire.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Paiement, PaiementSchema } from '../schemas/paiement.schema';
import { Facture, FactureSchema } from '../schemas/facture.schema';
import { OptionsService } from './options.service';
import { PaymentService } from './payment.service';
import { OptionsController } from './options.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: Offre.name, schema: OffreSchema },
      { name: User.name, schema: UserSchema },
      { name: OptionSupplementaire.name, schema: OptionSupplementaireSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: Facture.name, schema: FactureSchema },
    ]),
  ],
  controllers: [ReservationsController, OptionsController],
  providers: [ReservationsService, OptionsService, PaymentService],
  exports: [ReservationsService, OptionsService, PaymentService],
})
export class ReservationsModule {}
