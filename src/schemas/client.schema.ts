import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type ClientDocument = Client & Document;

@Schema()
export class Client {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop()
  telephone: string;

  @Prop()
  adresse: string;

  @Prop({ default: Date.now })
  date_inscription: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
