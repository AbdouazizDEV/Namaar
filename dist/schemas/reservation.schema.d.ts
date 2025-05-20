import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Voiture } from './voiture.schema';
import { Offre } from './offre.schema';
import { OptionSupplementaire } from './option-supplementaire.schema';
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
    options: OptionSupplementaire[];
    code_promo: string;
    etape_reservation: number;
    acompte_paye: boolean;
    montant_acompte: number;
    commentaires: string;
}
export declare const ReservationSchema: MongooseSchema<Reservation, import("mongoose").Model<Reservation, any, any, any, Document<unknown, any, Reservation, any> & Reservation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reservation, Document<unknown, {}, import("mongoose").FlatRecord<Reservation>, {}> & import("mongoose").FlatRecord<Reservation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
