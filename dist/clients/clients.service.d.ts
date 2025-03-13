import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { ClientDocument } from '../schemas/client.schema';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
export declare class ClientsService {
    private userModel;
    private clientModel;
    constructor(userModel: Model<UserDocument>, clientModel: Model<ClientDocument>);
    getAllClients(): Promise<{
        telephone: string | null;
        adresse: string | null;
        date_inscription: Date | null;
        _id: import("mongoose").Types.ObjectId;
        nom: string;
        prenom: string;
        email: string;
        mot_de_passe: string;
        role: string;
        statut: string;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
    getClientById(id: string): Promise<{
        telephone: string;
        adresse: string;
        date_inscription: Date;
        _id: import("mongoose").Types.ObjectId;
        nom: string;
        prenom: string;
        email: string;
        mot_de_passe: string;
        role: string;
        statut: string;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    updateClientStatus(id: string, updateClientStatusDto: UpdateClientStatusDto): Promise<{
        message: string;
    }>;
    getClientStats(): Promise<{
        total: number;
        actifs: number;
        inactifs: number;
        nouveauxCeMois: number;
    }>;
}
