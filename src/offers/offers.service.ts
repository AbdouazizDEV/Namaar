// src/offers/offers.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offre, OffreDocument } from '../schemas/offre.schema';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FilterOffersDto } from './dto/filter-offers.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offre.name) private offreModel: Model<OffreDocument>,
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
  ) {}

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offre> {
    // Vérifier que la date de fin est postérieure à la date de début
    if (
      new Date(createOfferDto.date_fin) <= new Date(createOfferDto.date_debut)
    ) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      );
    }

    // Vérifier que les voitures existent
    if (createOfferDto.voitures && createOfferDto.voitures.length > 0) {
      const vehicleCount = await this.voitureModel.countDocuments({
        _id: { $in: createOfferDto.voitures },
      });

      if (vehicleCount !== createOfferDto.voitures.length) {
        throw new BadRequestException(
          "Certaines voitures spécifiées n'existent pas",
        );
      }
    }

    // Générer un code promo aléatoire si non fourni
    if (!createOfferDto.code_promo) {
      createOfferDto.code_promo = this.generatePromoCode();
    }

    const newOffer = new this.offreModel(createOfferDto);
    return newOffer.save();
  }

  async getAllOffers(): Promise<Offre[]> {
    return this.offreModel.find().populate('voitures').exec();
  }

  async getOfferById(id: string): Promise<Offre> {
    const offer = await this.offreModel
      .findById(id)
      .populate('voitures')
      .exec();
    if (!offer) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    return offer;
  }

  async updateOffer(
    id: string,
    updateOfferDto: UpdateOfferDto,
  ): Promise<Offre> {
    // Vérifier que les dates sont cohérentes si elles sont fournies
    if (updateOfferDto.date_debut && updateOfferDto.date_fin) {
      if (
        new Date(updateOfferDto.date_fin) <= new Date(updateOfferDto.date_debut)
      ) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début',
        );
      }
    } else if (updateOfferDto.date_debut) {
      const offer = await this.offreModel.findById(id);
      if (new Date(offer!.date_fin) <= new Date(updateOfferDto.date_debut)) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début',
        );
      }
    } else if (updateOfferDto.date_fin) {
      const offer = await this.offreModel.findById(id);
      if (new Date(updateOfferDto.date_fin) <= new Date(offer!.date_debut)) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début',
        );
      }
    }

    // Vérifier que les voitures existent
    if (updateOfferDto.voitures && updateOfferDto.voitures.length > 0) {
      const vehicleCount = await this.voitureModel.countDocuments({
        _id: { $in: updateOfferDto.voitures },
      });

      if (vehicleCount !== updateOfferDto.voitures.length) {
        throw new BadRequestException(
          "Certaines voitures spécifiées n'existent pas",
        );
      }
    }

    const updatedOffer = await this.offreModel
      .findByIdAndUpdate(id, updateOfferDto, { new: true })
      .populate('voitures')
      .exec();

    if (!updatedOffer) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }

    return updatedOffer;
  }

  async deleteOffer(id: string): Promise<{ message: string }> {
    const result = await this.offreModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }

    return { message: 'Offre supprimée avec succès' };
  }

  async filterOffers(filterDto: FilterOffersDto): Promise<Offre[]> {
    const query: any = {};

    if (filterDto.statut) {
      query.statut = filterDto.statut;
    }

    if (filterDto.date_debut) {
      query.date_debut = { $gte: new Date(filterDto.date_debut) };
    }

    if (filterDto.date_fin) {
      query.date_fin = { $lte: new Date(filterDto.date_fin) };
    }

    if (filterDto.date_debut_min) {
      query.date_debut = { ...query.date_debut, $gte: new Date(filterDto.date_debut_min) };
    }

    if (filterDto.date_fin_max) {
      query.date_fin = { ...query.date_fin, $lte: new Date(filterDto.date_fin_max) };
    }

    return this.offreModel.find(query).populate('voitures').exec();
  }

  async getActiveOffers(): Promise<Offre[]> {
    const currentDate = new Date();
    return this.offreModel
      .find({
        statut: 'active',
        date_debut: { $lte: currentDate },
        date_fin: { $gte: currentDate },
      })
      .populate('voitures')
      .exec();
  }

  private generatePromoCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
