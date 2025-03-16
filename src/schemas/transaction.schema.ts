// src/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation_id: Reservation;

  @Prop({ required: true })
  montant: number;

  @Prop({ required: true })
  methode: string; // 'carte', 'paypal', etc.

  @Prop({ required: true })
  date_transaction: Date;

  @Prop({
    enum: ['en_attente', 'completee', 'echouee', 'remboursee'],
    default: 'en_attente',
  })
  statut: string;

  @Prop()
  reference_paiement: string;

  @Prop({ default: false })
  est_acompte: boolean;

  // Correction : spécifier explicitement le type pour le champ details
  @Prop({ type: MongooseSchema.Types.Mixed })
  details: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
