import { PublicService } from './public.service';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getAllVehicles(searchDto: SearchVehiclesDto): Promise<any[]>;
    getVehicleDetails(id: string): Promise<import("./dto/vehicle-details.dto").VehicleDetailsDto>;
    getVehicleAvailability(id: string, dateDebut?: string, dateFin?: string): Promise<any>;
    getVehicleImages(id: string): Promise<string[]>;
    getActiveOffers(): Promise<any[]>;
    getOfferDetails(id: string): Promise<import("./dto/offer-details.dto").OfferDetailsDto>;
    searchVehicles(searchDto: SearchVehiclesDto): Promise<any[]>;
}
