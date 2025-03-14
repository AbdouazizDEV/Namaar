interface InvoiceData {
    numero: string;
    date_emission: Date;
    date_echeance: Date;
    notes?: string;
    Fields: {
        remise?: number;
    };
    client: {
        nom: string;
        prenom: string;
        email: string;
        telephone?: string;
        adresse?: string;
    };
    reservation: {
        date_debut: Date;
        date_fin: Date;
    };
    location: {
        km_depart: number;
        km_retour: number;
    };
    voiture: {
        marque: string;
        modele: string;
        annee: number;
        prix_location?: number;
    };
    cout_base: number;
    frais_supplementaires: number;
    montant_total: number;
    paiements: {
        date_paiement: Date;
        montant: number;
    }[];
}
export declare class PdfService {
    private colors;
    generateInvoice(invoiceData: InvoiceData): Promise<string>;
    private drawSectionTitle;
    private drawTableRow;
}
export {};
