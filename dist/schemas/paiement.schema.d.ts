import { Document, Schema as MongooseSchema } from 'mongoose';
import { Facture } from './facture.schema';
import { Reservation } from './reservation.schema';
export type PaiementDocument = Paiement & Document;
export declare class Paiement {
    facture_id: Facture | string;
    reservation_id: Reservation | string;
    montant: number;
    methode: string;
    reference: string;
    date_paiement: Date;
    statut: string;
}
export declare const PaiementSchema: MongooseSchema<Paiement, import("mongoose").Model<Paiement, any, any, any, Document<unknown, any, Paiement> & Paiement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Paiement, Document<unknown, {}, import("mongoose").FlatRecord<Paiement>> & import("mongoose").FlatRecord<Paiement> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
