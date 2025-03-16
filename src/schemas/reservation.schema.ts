// src/schemas/reservation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';
import { OptionSupplementaire } from './option-supplementaire.schema';

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

  @Prop({
    type: [
      { type: MongooseSchema.Types.ObjectId, ref: 'OptionSupplementaire' },
    ],
  })
  options: OptionSupplementaire[];

  @Prop()
  code_promo: string;

  @Prop({ default: 1 })
  etape_reservation: number; // 1: Sélection véhicule, 2: Options, 3: Récapitulatif, 4: Paiement, 5: Confirmation

  @Prop({ default: false })
  acompte_paye: boolean;

  @Prop({ default: 0 })
  montant_acompte: number;

  @Prop()
  commentaires: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
