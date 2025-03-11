import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Voiture } from './voiture.schema';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Voiture',
    required: true,
  })
  voiture_id: Voiture;

  @Prop({ required: true })
  chemin: string;

  @Prop({ default: false })
  est_principale: boolean;

  @Prop({ default: Date.now })
  date_ajout: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
