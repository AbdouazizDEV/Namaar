import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    createReservation(req: any, createReservationDto: CreateReservationDto): Promise<import("../schemas/reservation.schema").Reservation>;
    getAllReservations(): Promise<import("../schemas/reservation.schema").Reservation[]>;
    filterReservations(filterDto: FilterReservationsDto): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getUserReservations(req: any): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getClientReservations(clientId: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getReservationById(id: string, req: any): Promise<import("../schemas/reservation.schema").Reservation>;
    updateReservation(id: string, updateReservationDto: UpdateReservationDto, req: any): Promise<import("../schemas/reservation.schema").Reservation>;
    changeReservationStatus(id: string, statut: string): Promise<import("../schemas/reservation.schema").Reservation>;
    deleteReservation(id: string, req: any): Promise<{
        message: string;
    }>;
    getDocumentId(doc: any): string;
}
