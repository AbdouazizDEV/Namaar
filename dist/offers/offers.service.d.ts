import { Model } from 'mongoose';
import { Offre, OffreDocument } from '../schemas/offre.schema';
import { VoitureDocument } from '../schemas/voiture.schema';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FilterOffersDto } from './dto/filter-offers.dto';
export declare class OffersService {
    private offreModel;
    private voitureModel;
    constructor(offreModel: Model<OffreDocument>, voitureModel: Model<VoitureDocument>);
    createOffer(createOfferDto: CreateOfferDto): Promise<Offre>;
    getAllOffers(): Promise<Offre[]>;
    getOfferById(id: string): Promise<Offre>;
    updateOffer(id: string, updateOfferDto: UpdateOfferDto): Promise<Offre>;
    deleteOffer(id: string): Promise<{
        message: string;
    }>;
    filterOffers(filterDto: FilterOffersDto): Promise<Offre[]>;
    getActiveOffers(): Promise<Offre[]>;
    private generatePromoCode;
}
