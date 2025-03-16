import { Document } from 'mongoose';
export type VoitureDocument = Voiture & Document;
export interface VoitureDocumentWithId extends VoitureDocument {
    _id: string;
    marque: string;
    modele: string;
    annee: number;
    prix_location: number;
    code: string;
    categorie: string;
    disponibilite: boolean;
    images: string[];
    description: string;
}
export declare class Voiture {
    marque: string;
    modele: string;
    annee: number;
    prix_location: number;
    code: string;
    categorie: string;
    disponibilite: boolean;
    images: string[];
    description: string;
}
export declare const VoitureSchema: import("mongoose").Schema<Voiture, import("mongoose").Model<Voiture, any, any, any, Document<unknown, any, Voiture> & Voiture & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Voiture, Document<unknown, {}, import("mongoose").FlatRecord<Voiture>> & import("mongoose").FlatRecord<Voiture> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
