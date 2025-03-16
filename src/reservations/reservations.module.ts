// src/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ClientReservationsController } from './client-reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  OptionSupplementaire,
  OptionSupplementaireSchema,
} from '../schemas/option-supplementaire.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Paiement, PaiementSchema } from '../schemas/paiement.schema';
import { Facture, FactureSchema } from '../schemas/facture.schema';
import { Client, ClientSchema } from '../schemas/client.schema';
import { OptionsService } from './options.service';
import { PaymentService } from './payment.service';
import { OptionsController } from './options.controller';
import { PdfService } from '../shared/pdf.service';
import { MailService } from '../locations/mail.service';

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
      { name: Client.name, schema: ClientSchema }, // Ajout du modèle Client
    ]),
  ],
  controllers: [
    ReservationsController,
    OptionsController,
    ClientReservationsController,
  ],
  providers: [
    ReservationsService,
    OptionsService,
    PaymentService,
    PdfService,
    MailService,
  ],
  exports: [ReservationsService, OptionsService, PaymentService],
})
export class ReservationsModule {}
