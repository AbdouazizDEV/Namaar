import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';
export type FavoriVoitureDocument = FavoriVoiture & Document;
export declare class FavoriVoiture {
    utilisateur_id: User;
    voiture_id: Voiture;
    date_ajout: Date;
}
export declare const FavoriVoitureSchema: MongooseSchema<FavoriVoiture, import("mongoose").Model<FavoriVoiture, any, any, any, Document<unknown, any, FavoriVoiture> & FavoriVoiture & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FavoriVoiture, Document<unknown, {}, import("mongoose").FlatRecord<FavoriVoiture>> & import("mongoose").FlatRecord<FavoriVoiture> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type FavoriOffreDocument = FavoriOffre & Document;
export declare class FavoriOffre {
    utilisateur_id: User;
    offre_id: Offre;
    date_ajout: Date;
}
export declare const FavoriOffreSchema: MongooseSchema<FavoriOffre, import("mongoose").Model<FavoriOffre, any, any, any, Document<unknown, any, FavoriOffre> & FavoriOffre & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FavoriOffre, Document<unknown, {}, import("mongoose").FlatRecord<FavoriOffre>> & import("mongoose").FlatRecord<FavoriOffre> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
