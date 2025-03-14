import { LocationsService } from './locations.service';
import { StartContractDto } from './dto/start-contract.dto';
import { EndContractDto } from './dto/end-contract.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { Response } from 'express';
interface TestInvoiceData {
    reservation_id: string;
    client_id: string;
    montant_total?: number;
}
export declare class LocationsController {
    private locationsService;
    constructor(locationsService: LocationsService);
    getAllLocations(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/location.schema").LocationContratDocument> & import("../schemas/location.schema").LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getLocationById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/location.schema").LocationContratDocument> & import("../schemas/location.schema").LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    startContract(startContractDto: StartContractDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/location.schema").LocationContratDocument> & import("../schemas/location.schema").LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    endContract(id: string, endContractDto: EndContractDto): Promise<{
        location: import("mongoose").Document<unknown, {}, import("../schemas/location.schema").LocationContratDocument> & import("../schemas/location.schema").LocationContrat & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        facture: import("mongoose").Document<unknown, {}, import("../schemas/facture.schema").FactureDocument> & import("../schemas/facture.schema").Facture & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    createPayment(reservationId: string, createPaymentDto: CreatePaymentDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/paiement.schema").PaiementDocument> & import("../schemas/paiement.schema").Paiement & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getAllInvoices(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/facture.schema").FactureDocument> & import("../schemas/facture.schema").Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getClientInvoices(clientId: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/facture.schema").FactureDocument> & import("../schemas/facture.schema").Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getInvoiceById(id: string): Promise<{
        facture: import("mongoose").Document<unknown, {}, import("../schemas/facture.schema").FactureDocument> & import("../schemas/facture.schema").Facture & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        paiements: (import("mongoose").Document<unknown, {}, import("../schemas/paiement.schema").PaiementDocument> & import("../schemas/paiement.schema").Paiement & import("mongoose").Document<unknown, any, any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
    }>;
    getAllPayments(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/paiement.schema").PaiementDocument> & import("../schemas/paiement.schema").Paiement & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getInvoicePayments(factureId: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/paiement.schema").PaiementDocument> & import("../schemas/paiement.schema").Paiement & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    generateInvoicePdf(id: string, res: Response): Promise<void>;
    sendInvoiceByEmail(id: string, emailData: {
        email?: string;
    }): Promise<{
        message: string;
    }>;
    createTestInvoice(testData: TestInvoiceData): Promise<import("mongoose").Document<unknown, {}, import("../schemas/facture.schema").FactureDocument> & import("../schemas/facture.schema").Facture & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
export {};
