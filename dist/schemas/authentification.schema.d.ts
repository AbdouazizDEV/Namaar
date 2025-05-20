import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
export type AuthentificationDocument = Authentification & Document;
export declare class Authentification {
    utilisateur_id: User;
    token: string;
    type: string;
    date_expiration: Date;
    ip_address: string;
    user_agent: string;
    est_utilise: boolean;
}
export declare const AuthentificationSchema: MongooseSchema<Authentification, import("mongoose").Model<Authentification, any, any, any, Document<unknown, any, Authentification, any> & Authentification & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Authentification, Document<unknown, {}, import("mongoose").FlatRecord<Authentification>, {}> & import("mongoose").FlatRecord<Authentification> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
