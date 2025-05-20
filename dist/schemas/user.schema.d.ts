import { Document, Types } from 'mongoose';
export interface UserDocument extends Document {
    _id: Types.ObjectId | string;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    role: string;
    statut: string;
}
export declare class User {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    role: string;
    statut: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
