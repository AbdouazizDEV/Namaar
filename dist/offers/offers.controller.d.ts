import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FilterOffersDto } from './dto/filter-offers.dto';
export declare class OffersController {
    private offersService;
    constructor(offersService: OffersService);
    createOffer(createOfferDto: CreateOfferDto): Promise<import("../schemas/offre.schema").Offre>;
    getAllOffers(): Promise<import("../schemas/offre.schema").Offre[]>;
    getActiveOffers(): Promise<import("../schemas/offre.schema").Offre[]>;
    filterOffers(filterDto: FilterOffersDto): Promise<import("../schemas/offre.schema").Offre[]>;
    getOfferById(id: string): Promise<import("../schemas/offre.schema").Offre>;
    updateOffer(id: string, updateOfferDto: UpdateOfferDto): Promise<import("../schemas/offre.schema").Offre>;
    deleteOffer(id: string): Promise<{
        message: string;
    }>;
}
