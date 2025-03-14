import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Cette interface définit le type complet avec l'ID que Mongoose ajoute
export interface UserDocument extends Document {
  _id: Types.ObjectId | string;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  role: string;
  statut: string;
}

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
