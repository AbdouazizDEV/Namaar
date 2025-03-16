// src/schemas/option-supplementaire.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OptionSupplementaireDocument = OptionSupplementaire & Document;

@Schema()
export class OptionSupplementaire {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  prix: number;

  @Prop({ default: true })
  disponible: boolean;

  @Prop({ default: 'option' })
  type: string; // 'option', 'assurance', 'service', etc.
}

export const OptionSupplementaireSchema =
  SchemaFactory.createForClass(OptionSupplementaire);
