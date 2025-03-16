import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { ReservationDocument } from '../schemas/reservation.schema';
import { Paiement, PaiementDocument } from '../schemas/paiement.schema';
import { Facture, FactureDocument } from '../schemas/facture.schema';
import { UserDocument } from '../schemas/user.schema';
import { PaymentDto } from './dto/reservation-step.dto';
import { PdfService } from '../shared/pdf.service';
export declare class PaymentService {
    private transactionModel;
    private reservationModel;
    private paiementModel;
    private factureModel;
    private userModel;
    private readonly pdfService;
    constructor(transactionModel: Model<TransactionDocument>, reservationModel: Model<ReservationDocument>, paiementModel: Model<PaiementDocument>, factureModel: Model<FactureDocument>, userModel: Model<UserDocument>, pdfService: PdfService);
    processPayment(userId: string, paymentDto: PaymentDto): Promise<Transaction>;
    getPaymentMethods(): Promise<string[]>;
    payRemainingAmount(userId: string, reservationId: string, paymentMethod: string, token?: string): Promise<Transaction>;
    private simulerPaiement;
    private generatePaymentReference;
    getReservationPayments(reservationId: string): Promise<Paiement[]>;
    getReservationInvoice(reservationId: string): Promise<Facture>;
    refundPayment(paymentId: string): Promise<Paiement | null>;
    private simulerRemboursement;
    generateInvoicePdf(reservationId: string): Promise<{
        filePath: string;
        fileName: string;
    }>;
    getInvoicePdfPath(reservationId: string): Promise<{
        filePath: string;
        fileName: string;
    }>;
    private findExistingInvoicePdf;
}
