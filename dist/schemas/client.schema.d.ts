import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
export type ClientDocument = Client & Document;
export declare class Client {
    utilisateur_id: User;
    telephone: string;
    adresse: string;
    date_inscription: Date;
}
export declare const ClientSchema: MongooseSchema<Client, import("mongoose").Model<Client, any, any, any, Document<unknown, any, Client, any> & Client & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Client, Document<unknown, {}, import("mongoose").FlatRecord<Client>, {}> & import("mongoose").FlatRecord<Client> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
