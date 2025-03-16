import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from './reservation.schema';
export type TransactionDocument = Transaction & Document;
export declare class Transaction {
    reservation_id: Reservation;
    montant: number;
    methode: string;
    date_transaction: Date;
    statut: string;
    reference_paiement: string;
    est_acompte: boolean;
    details: Record<string, any>;
}
export declare const TransactionSchema: MongooseSchema<Transaction, import("mongoose").Model<Transaction, any, any, any, Document<unknown, any, Transaction> & Transaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, Document<unknown, {}, import("mongoose").FlatRecord<Transaction>> & import("mongoose").FlatRecord<Transaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
