import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type AuthentificationDocument = Authentification & Document;

@Schema()
export class Authentification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: ['session', 'reset_password', 'remember_me'] })
  type: string;

  @Prop({ required: true })
  date_expiration: Date;

  @Prop()
  ip_address: string;

  @Prop()
  user_agent: string;

  @Prop({ default: false })
  est_utilise: boolean;
}

export const AuthentificationSchema =
  SchemaFactory.createForClass(Authentification);
