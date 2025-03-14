// src/schemas/paiement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Facture } from './facture.schema';
import { Reservation } from './reservation.schema';

export type PaiementDocument = Paiement & Document;

@Schema()
export class Paiement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facture', required: true })
  facture_id: Facture | string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation_id: Reservation | string;

  @Prop({ required: true })
  montant: number;

  @Prop({ required: true })
  methode: string;

  @Prop()
  reference: string;

  @Prop({ required: true })
  date_paiement: Date;

  @Prop({ enum: ['en_attente', 'validé', 'refusé'], default: 'validé' })
  statut: string;
}

export const PaiementSchema = SchemaFactory.createForClass(Paiement);
