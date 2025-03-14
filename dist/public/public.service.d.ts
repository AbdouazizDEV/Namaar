import { Model } from 'mongoose';
import { Voiture } from '../schemas/voiture.schema';
import { Image } from '../schemas/image.schema';
import { Offre } from '../schemas/offre.schema';
import { Reservation } from '../schemas/reservation.schema';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { VehicleDetailsDto } from './dto/vehicle-details.dto';
import { OfferDetailsDto } from './dto/offer-details.dto';
export declare class PublicService {
    private voitureModel;
    private imageModel;
    private offreModel;
    private reservationModel;
    constructor(voitureModel: Model<Voiture>, imageModel: Model<Image>, offreModel: Model<Offre>, reservationModel: Model<Reservation>);
    searchVehicles(searchDto: SearchVehiclesDto): Promise<any[]>;
    getVehicleDetails(id: string): Promise<VehicleDetailsDto>;
    getVehicleAvailability(id: string, dateDebut?: Date, dateFin?: Date): Promise<any>;
    private trouverPeriodesAlternatives;
    getVehicleImages(id: string): Promise<string[]>;
    getActiveOffers(): Promise<any[]>;
    getOfferDetails(id: string): Promise<OfferDetailsDto>;
}
