import { ClientsService } from './clients.service';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    getAllClients(): Promise<{
        telephone: string | null;
        adresse: string | null;
        date_inscription: Date | null;
        _id: import("mongoose").Types.ObjectId | string;
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
    getClientStats(): Promise<{
        total: number;
        actifs: number;
        inactifs: number;
        nouveauxCeMois: number;
    }>;
    getClientById(id: string): Promise<{
        telephone: string;
        adresse: string;
        date_inscription: Date;
        _id: import("mongoose").Types.ObjectId | string;
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
}
