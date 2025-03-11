import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';

export type FavoriVoitureDocument = FavoriVoiture & Document;

@Schema()
export class FavoriVoiture {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Voiture', required: true })
  voiture_id: Voiture;

  @Prop({ default: Date.now })
  date_ajout: Date;
}

export const FavoriVoitureSchema = SchemaFactory.createForClass(FavoriVoiture);

export type FavoriOffreDocument = FavoriOffre & Document;

@Schema()
export class FavoriOffre {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  utilisateur_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Offre', required: true })
  offre_id: Offre;

  @Prop({ default: Date.now })
  date_ajout: Date;
}

export const FavoriOffreSchema = SchemaFactory.createForClass(FavoriOffre);
