import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoitureDocument = Voiture & Document;

@Schema()
export class Voiture {
  @Prop({ required: true })
  marque: string;

  @Prop({ required: true })
  modele: string;

  @Prop({ required: true })
  annee: number;

  @Prop({ required: true })
  prix_location: number;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  categorie: string;

  @Prop({ default: true })
  disponibilite: boolean;

  @Prop([String])
  images: string[];

  @Prop()
  description: string;
}

export const VoitureSchema = SchemaFactory.createForClass(Voiture);
