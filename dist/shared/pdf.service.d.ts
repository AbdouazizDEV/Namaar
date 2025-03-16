export declare class PdfService {
    private readonly uploadDir;
    constructor();
    generateReservationConfirmation(reservation: any): Promise<string>;
    generateInvoice(data: any, facture: any): Promise<string>;
    private formatDate;
    private calculateDays;
    private getClientName;
    private getStatusLabel;
    private getInvoiceStatus;
}
