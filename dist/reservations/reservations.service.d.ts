import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { VoitureDocument } from '../schemas/voiture.schema';
import { OffreDocument } from '../schemas/offre.schema';
import { UserDocument } from '../schemas/user.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
export declare class ReservationsService {
    private reservationModel;
    private voitureModel;
    private offreModel;
    private userModel;
    constructor(reservationModel: Model<ReservationDocument>, voitureModel: Model<VoitureDocument>, offreModel: Model<OffreDocument>, userModel: Model<UserDocument>);
    createReservation(userId: string, createReservationDto: CreateReservationDto, isManager?: boolean): Promise<Reservation>;
    getClientReservations(clientId: string): Promise<Reservation[]>;
    getAllReservations(): Promise<Reservation[]>;
    getReservationById(id: string): Promise<Reservation>;
    getUserReservations(userId: string): Promise<Reservation[]>;
    updateReservation(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation>;
    changeReservationStatus(id: string, statut: string): Promise<Reservation>;
    filterReservations(filterDto: FilterReservationsDto): Promise<Reservation[]>;
    deleteReservation(id: string): Promise<{
        message: string;
    }>;
}
