import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';
import { Client } from './client.schema';

export type FactureDocument = Facture & Document;

@Schema()
export class Facture {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation_id: Reservation;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  client_id: Client;

  @Prop({ required: true })
  date_emission: Date;

  @Prop({ required: true })
  date_echeance: Date;

  @Prop({ required: true })
  montant_total: number;

  @Prop()
  notes: string;

  @Prop({ enum: ['en_attente', 'payée', 'annulée'], default: 'en_attente' })
  statut: string;
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
