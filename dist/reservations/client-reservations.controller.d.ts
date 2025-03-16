import { ReservationsService } from './reservations.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { PdfService } from '../shared/pdf.service';
import { MailService } from '../locations/mail.service';
import { Model } from 'mongoose';
import { ClientDocument } from '../schemas/client.schema';
import { VoitureDocument } from '../schemas/voiture.schema';
interface RemboursementInfo {
    montant_initial: number;
    frais_annulation: number;
    montant_rembourse: number;
    date_remboursement: Date;
}
export declare class ClientReservationsController {
    private readonly reservationsService;
    private readonly paymentService;
    private readonly pdfService;
    private readonly mailService;
    private clientModel;
    private voitureModel;
    constructor(reservationsService: ReservationsService, paymentService: PaymentService, pdfService: PdfService, mailService: MailService, clientModel: Model<ClientDocument>, voitureModel: Model<VoitureDocument>);
    getClientReservations(req: any, status?: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getReservationHistory(req: any): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getReservationDetails(id: string, req: any): Promise<import("../schemas/reservation.schema").Reservation>;
    updateReservation(id: string, updateReservationDto: UpdateReservationDto, req: any): Promise<import("../schemas/reservation.schema").Reservation | null>;
    cancelReservation(id: string, req: any): Promise<{
        message: string;
        frais_annulation: number;
        remboursement: RemboursementInfo | null;
    }>;
    getReservationConfirmation(id: string, req: any, res: Response): Promise<unknown>;
    getReservationInvoice(id: string, req: any, res: Response): Promise<void>;
    sendInvoiceByEmail(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private getDocumentId;
}
export {};
