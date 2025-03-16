import { Document } from 'mongoose';
export type OptionSupplementaireDocument = OptionSupplementaire & Document;
export declare class OptionSupplementaire {
    nom: string;
    description: string;
    prix: number;
    disponible: boolean;
    type: string;
}
export declare const OptionSupplementaireSchema: import("mongoose").Schema<OptionSupplementaire, import("mongoose").Model<OptionSupplementaire, any, any, any, Document<unknown, any, OptionSupplementaire> & OptionSupplementaire & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OptionSupplementaire, Document<unknown, {}, import("mongoose").FlatRecord<OptionSupplementaire>> & import("mongoose").FlatRecord<OptionSupplementaire> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
