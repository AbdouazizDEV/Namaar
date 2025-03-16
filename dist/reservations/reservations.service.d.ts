import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { VoitureDocument } from '../schemas/voiture.schema';
import { OffreDocument } from '../schemas/offre.schema';
import { UserDocument } from '../schemas/user.schema';
import { OptionSupplementaireDocument } from '../schemas/option-supplementaire.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
import { ReservationStepDto, OptionsSelectionDto } from './dto/reservation-step.dto';
import { OptionsService } from './options.service';
export declare class ReservationsService {
    private reservationModel;
    private voitureModel;
    private offreModel;
    private userModel;
    private optionModel;
    private optionsService;
    constructor(reservationModel: Model<ReservationDocument>, voitureModel: Model<VoitureDocument>, offreModel: Model<OffreDocument>, userModel: Model<UserDocument>, optionModel: Model<OptionSupplementaireDocument>, optionsService: OptionsService);
    createReservation(userId: string, createReservationDto: CreateReservationDto, isManager?: boolean): Promise<Reservation>;
    startReservationProcess(userId: string, createReservationDto: CreateReservationDto): Promise<Reservation>;
    moveToNextStep(userId: string, stepDto: ReservationStepDto): Promise<Reservation | null>;
    selectOptions(userId: string, optionsDto: OptionsSelectionDto): Promise<Reservation | null>;
    getReservationSummary(userId: string, reservationId: string): Promise<any>;
    applyPromoCode(userId: string, reservationId: string, codePromo: string): Promise<Reservation | null>;
    getClientReservations(clientId: string): Promise<Reservation[]>;
    getAllReservations(): Promise<Reservation[]>;
    getReservationById(id: string): Promise<Reservation>;
    getUserReservations(userId: string): Promise<Reservation[]>;
    updateReservation(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation | null>;
    changeReservationStatus(id: string, statut: string): Promise<Reservation | null>;
    filterReservations(filterDto: FilterReservationsDto): Promise<Reservation[]>;
    deleteReservation(id: string): Promise<{
        message: string;
    }>;
}
