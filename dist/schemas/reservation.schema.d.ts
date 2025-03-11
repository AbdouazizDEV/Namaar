import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';
export type ReservationDocument = Reservation & Document;
export declare class Reservation {
    utilisateur_id: User;
    voiture_id: Voiture;
    date_debut: Date;
    date_fin: Date;
    statut: string;
    prix_total: number;
    offre_id: Offre;
    date_reservation: Date;
}
export declare const ReservationSchema: MongooseSchema<Reservation, import("mongoose").Model<Reservation, any, any, any, Document<unknown, any, Reservation> & Reservation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reservation, Document<unknown, {}, import("mongoose").FlatRecord<Reservation>> & import("mongoose").FlatRecord<Reservation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
