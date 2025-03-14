import { Model } from 'mongoose';
import { LocationContrat, LocationContratDocument } from '../schemas/location.schema';
import { ReservationDocument } from '../schemas/reservation.schema';
import { VoitureDocument } from '../schemas/voiture.schema';
import { UserDocument } from '../schemas/user.schema';
import { Facture, FactureDocument } from '../schemas/facture.schema';
import { Paiement, PaiementDocument } from '../schemas/paiement.schema';
import { ClientDocument } from '../schemas/client.schema';
import { OffreDocument } from '../schemas/offre.schema';
import { StartContractDto } from './dto/start-contract.dto';
import { EndContractDto } from './dto/end-contract.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { MailService } from './mail.service';
import { PdfService } from './pdf.service';
export declare class LocationsService {
    private locationModel;
    private reservationModel;
    private voitureModel;
    private userModel;
    private factureModel;
    private paiementModel;
    private clientModel;
    private offreModel;
    private mailService;
    private pdfService;
    constructor(locationModel: Model<LocationContratDocument>, reservationModel: Model<ReservationDocument>, voitureModel: Model<VoitureDocument>, userModel: Model<UserDocument>, factureModel: Model<FactureDocument>, paiementModel: Model<PaiementDocument>, clientModel: Model<ClientDocument>, offreModel: Model<OffreDocument>, mailService: MailService, pdfService: PdfService);
    getAllLocations(): Promise<(import("mongoose").Document<unknown, {}, LocationContratDocument> & LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getLocationById(id: string): Promise<import("mongoose").Document<unknown, {}, LocationContratDocument> & LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    startContract(startContractDto: StartContractDto): Promise<import("mongoose").Document<unknown, {}, LocationContratDocument> & LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    endContract(id: string, endContractDto: EndContractDto): Promise<{
        location: import("mongoose").Document<unknown, {}, LocationContratDocument> & LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        facture: import("mongoose").Document<unknown, {}, FactureDocument> & Facture & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    createTestInvoice(testData: {
        reservation_id: string;
        client_id: string;
        montant_total?: number;
    }): Promise<import("mongoose").Document<unknown, {}, FactureDocument> & Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    generateInvoice(location: LocationContratDocument): Promise<import("mongoose").Document<unknown, {}, FactureDocument> & Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    createPayment(reservationId: string, createPaymentDto: CreatePaymentDto): Promise<import("mongoose").Document<unknown, {}, PaiementDocument> & Paiement & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getInvoices(clientId?: string): Promise<(import("mongoose").Document<unknown, {}, FactureDocument> & Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getInvoiceById(id: string): Promise<{
        facture: import("mongoose").Document<unknown, {}, FactureDocument> & Facture & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        paiements: (import("mongoose").Document<unknown, {}, PaiementDocument> & Paiement & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
    }>;
    getPayments(factureId?: string): Promise<(import("mongoose").Document<unknown, {}, PaiementDocument> & Paiement & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    generateInvoicePdf(factureId: string): Promise<string>;
    sendInvoiceByEmail(factureId: string, customEmail?: string): Promise<{
        message: string;
    }>;
}
