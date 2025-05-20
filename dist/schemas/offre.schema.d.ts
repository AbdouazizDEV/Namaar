import { Document, Schema as MongooseSchema } from 'mongoose';
import { Voiture } from './voiture.schema';
export type OffreDocument = Offre & Document;
export declare class Offre {
    titre: string;
    description: string;
    reduction: number;
    date_debut: Date;
    date_fin: Date;
    statut: string;
    code_promo: string;
    voitures: Voiture[];
}
export declare const OffreSchema: MongooseSchema<Offre, import("mongoose").Model<Offre, any, any, any, Document<unknown, any, Offre, any> & Offre & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Offre, Document<unknown, {}, import("mongoose").FlatRecord<Offre>, {}> & import("mongoose").FlatRecord<Offre> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
