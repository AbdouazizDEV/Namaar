// src/schemas/alerte.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlerteDocument = Alerte & Document;

@Schema({ timestamps: true })
export class Alerte {
  @Prop({ required: true })
  type: string; // 'retard', 'maintenance', 'paiement', 'disponibilité'

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  priorite: string; // 'haute', 'moyenne', 'basse'

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'any', required: false })
  entiteId?: Types.ObjectId;

  @Prop({ required: false })
  entiteType?: string; // Type d'entité concernée: 'reservation', 'location', 'voiture', etc.

  @Prop({ required: false })
  action?: string; // Action suggérée

  @Prop({ default: false })
  traitee: boolean;

  @Prop({ type: Date })
  dateTraitement?: Date;
}

export const AlerteSchema = SchemaFactory.createForClass(Alerte);
