import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';

export type LocationDocument = Location & Document;

@Schema()
export class Location {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation_id: Reservation;

  @Prop({ required: true })
  date_debut_reelle: Date;

  @Prop()
  date_fin_reelle: Date;

  @Prop({ required: true })
  km_depart: number;

  @Prop()
  km_retour: number;

  @Prop({ required: true })
  etat_depart: string;

  @Prop()
  etat_retour: string;

  @Prop({ default: 0 })
  frais_supplementaires: number;

  @Prop({ enum: ['en_cours', 'terminee', 'retard'], default: 'en_cours' })
  statut: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
