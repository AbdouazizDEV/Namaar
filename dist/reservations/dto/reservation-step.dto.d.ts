export declare class ReservationStepDto {
    reservation_id: string;
    etape: number;
}
export declare class OptionsSelectionDto {
    reservation_id: string;
    options_ids: string[];
}
export declare class PaymentDto {
    reservation_id: string;
    methode_paiement: string;
    payer_acompte: boolean;
    token_paiement?: string;
}
