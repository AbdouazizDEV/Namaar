import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';
import { Client } from './client.schema';
export type FactureDocument = Facture & Document;
export declare class Facture {
    reservation_id: Reservation | string;
    client_id: Client | string;
    date_emission: Date;
    date_echeance: Date;
    montant_total: number;
    notes: string;
    statut: string;
}
export declare const FactureSchema: MongooseSchema<Facture, import("mongoose").Model<Facture, any, any, any, Document<unknown, any, Facture> & Facture & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Facture, Document<unknown, {}, import("mongoose").FlatRecord<Facture>> & import("mongoose").FlatRecord<Facture> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
