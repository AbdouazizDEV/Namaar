import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Voiture } from './voiture.schema';

export type OffreDocument = Offre & Document;

@Schema()
export class Offre {
  @Prop({ required: true })
  titre: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  reduction: number;

  @Prop({ required: true })
  date_debut: Date;

  @Prop({ required: true })
  date_fin: Date;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  statut: string;

  @Prop()
  code_promo: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Voiture' }])
  voitures: Voiture[];
}

export const OffreSchema = SchemaFactory.createForClass(Offre);
