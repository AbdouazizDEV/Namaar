import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';
export type LocationContratDocument = LocationContrat & Document;
export declare class LocationContrat {
    reservation_id: Reservation | string;
    date_debut_reelle: Date;
    date_fin_reelle: Date;
    km_depart: number;
    km_retour: number;
    etat_depart: string;
    etat_retour: string;
    frais_supplementaires: number;
    statut: string;
}
export declare const LocationContratSchema: MongooseSchema<LocationContrat, import("mongoose").Model<LocationContrat, any, any, any, Document<unknown, any, LocationContrat, any> & LocationContrat & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LocationContrat, Document<unknown, {}, import("mongoose").FlatRecord<LocationContrat>, {}> & import("mongoose").FlatRecord<LocationContrat> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
