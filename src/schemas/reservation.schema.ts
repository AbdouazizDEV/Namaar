import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Voiture', required: true })
  voiture_id: Voiture;

  @Prop({ required: true })
  date_debut: Date;

  @Prop({ required: true })
  date_fin: Date;

  @Prop({
    enum: ['en_attente', 'confirmee', 'annulee', 'terminee'],
    default: 'en_attente',
  })
  statut: string;

  @Prop({ required: true })
  prix_total: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Offre' })
  offre_id: Offre;

  @Prop({ default: Date.now })
  date_reservation: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
