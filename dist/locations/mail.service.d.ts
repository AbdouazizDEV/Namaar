export declare class MailService {
    private transporter;
    constructor();
    sendInvoiceEmail(to: string, subject: string, text: string, pdfPath: string): Promise<void>;
}
