// src/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop({ required: true })
  type: string; // 'disponibilite', 'prix', 'offre'

  @Prop({ required: true })
  titre: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  lue: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  entite_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  entite_type: string; // 'voiture', 'offre'

  @Prop({ default: Date.now })
  date: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
