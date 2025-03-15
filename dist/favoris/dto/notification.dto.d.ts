export declare class NotificationDto {
    id: string;
    type: 'disponibilite' | 'prix' | 'offre';
    titre: string;
    message: string;
    date: Date;
    lue: boolean;
    entite_id?: string;
    entite_type?: string;
}
