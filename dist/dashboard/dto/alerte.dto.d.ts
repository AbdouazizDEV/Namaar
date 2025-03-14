export declare class AlerteDto {
    id: string;
    type: string;
    message: string;
    priorite: string;
    date: Date;
    entiteId?: string;
    entiteType?: string;
    action?: string;
    traitee: boolean;
    dateTraitement?: Date;
}
export declare class AlertesDto {
    alertes: AlerteDto[];
    nombreTotal: number;
    nombreHautePriorite: number;
}
