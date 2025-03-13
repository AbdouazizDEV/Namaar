// src/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Offre, OffreSchema } from '../schemas/offre.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Voiture.name, schema: VoitureSchema },
      { name: Offre.name, schema: OffreSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
