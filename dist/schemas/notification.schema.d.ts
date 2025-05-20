import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
export type NotificationDocument = Notification & Document;
export declare class Notification {
    utilisateur_id: User;
    type: string;
    titre: string;
    message: string;
    lue: boolean;
    entite_id: MongooseSchema.Types.ObjectId;
    entite_type: string;
    date: Date;
}
export declare const NotificationSchema: MongooseSchema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any> & Notification & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
