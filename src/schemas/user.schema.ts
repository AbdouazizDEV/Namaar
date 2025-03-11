import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prenom: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mot_de_passe: string;

  @Prop({ required: true, enum: ['client', 'gérant'] })
  role: string;

  @Prop({ required: true, enum: ['actif', 'inactif'], default: 'actif' })
  statut: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
