import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';
export type LocationDocument = Location & Document;
export declare class Location {
    reservation_id: Reservation;
    date_debut_reelle: Date;
    date_fin_reelle: Date;
    km_depart: number;
    km_retour: number;
    etat_depart: string;
    etat_retour: string;
    frais_supplementaires: number;
    statut: string;
}
export declare const LocationSchema: MongooseSchema<Location, import("mongoose").Model<Location, any, any, any, Document<unknown, any, Location> & Location & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Location, Document<unknown, {}, import("mongoose").FlatRecord<Location>> & import("mongoose").FlatRecord<Location> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
