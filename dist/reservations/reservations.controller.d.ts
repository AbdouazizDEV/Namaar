import { ReservationsService } from './reservations.service';
import { PaymentService } from './payment.service';
import { OptionsService } from './options.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
import { ReservationStepDto, OptionsSelectionDto, PaymentDto } from './dto/reservation-step.dto';
export declare class ReservationsController {
    private reservationsService;
    private paymentService;
    private optionsService;
    constructor(reservationsService: ReservationsService, paymentService: PaymentService, optionsService: OptionsService);
    createReservation(req: any, createReservationDto: CreateReservationDto): Promise<import("../schemas/reservation.schema").Reservation>;
    getAllReservations(): Promise<import("../schemas/reservation.schema").Reservation[]>;
    filterReservations(filterDto: FilterReservationsDto): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getUserReservations(req: any): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getClientReservations(clientId: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getReservationById(id: string, req: any): Promise<import("../schemas/reservation.schema").Reservation>;
    updateReservation(id: string, updateReservationDto: UpdateReservationDto, req: any): Promise<import("../schemas/reservation.schema").Reservation | null>;
    changeReservationStatus(id: string, statut: string): Promise<import("../schemas/reservation.schema").Reservation | null>;
    deleteReservation(id: string, req: any): Promise<{
        message: string;
    }>;
    startReservationProcess(req: any, createReservationDto: CreateReservationDto): Promise<import("../schemas/reservation.schema").Reservation>;
    moveToNextStep(req: any, stepDto: ReservationStepDto): Promise<import("../schemas/reservation.schema").Reservation | null>;
    selectOptions(req: any, optionsDto: OptionsSelectionDto): Promise<import("../schemas/reservation.schema").Reservation | null>;
    getReservationSummary(req: any, id: string): Promise<any>;
    applyPromoCode(req: any, id: string, codePromo: string): Promise<import("../schemas/reservation.schema").Reservation | null>;
    processPayment(req: any, paymentDto: PaymentDto): Promise<import("../schemas/transaction.schema").Transaction>;
    getDocumentId(doc: any): string;
}
