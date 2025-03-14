import { Document, Types } from 'mongoose';
export type AlerteDocument = Alerte & Document;
export declare class Alerte {
    type: string;
    message: string;
    priorite: string;
    date: Date;
    entiteId?: Types.ObjectId;
    entiteType?: string;
    action?: string;
    traitee: boolean;
    dateTraitement?: Date;
}
export declare const AlerteSchema: import("mongoose").Schema<Alerte, import("mongoose").Model<Alerte, any, any, any, Document<unknown, any, Alerte> & Alerte & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alerte, Document<unknown, {}, import("mongoose").FlatRecord<Alerte>> & import("mongoose").FlatRecord<Alerte> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
