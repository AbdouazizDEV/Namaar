import { Document, Schema as MongooseSchema } from 'mongoose';
import { Voiture } from './voiture.schema';
export type ImageDocument = Image & Document;
export declare class Image {
    voiture_id: Voiture;
    chemin: string;
    est_principale: boolean;
    date_ajout: Date;
}
export declare const ImageSchema: MongooseSchema<Image, import("mongoose").Model<Image, any, any, any, Document<unknown, any, Image> & Image & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Image, Document<unknown, {}, import("mongoose").FlatRecord<Image>> & import("mongoose").FlatRecord<Image> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
