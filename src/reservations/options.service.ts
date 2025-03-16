// src/reservations/options.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OptionSupplementaire,
  OptionSupplementaireDocument,
} from '../schemas/option-supplementaire.schema';

@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(OptionSupplementaire.name)
    private optionModel: Model<OptionSupplementaireDocument>,
  ) {}

  async getAllOptions(): Promise<OptionSupplementaire[]> {
    return this.optionModel.find({ disponible: true }).exec();
  }

  async getOptionById(id: string): Promise<OptionSupplementaire> {
    const option = await this.optionModel.findById(id).exec();
    if (!option) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }
    return option;
  }

  async calculerPrixOptions(optionsIds: string[]): Promise<number> {
    if (!optionsIds || optionsIds.length === 0) {
      return 0;
    }

    const options = await this.optionModel
      .find({
        _id: { $in: optionsIds },
        disponible: true,
      })
      .exec();

    return options.reduce((total, option) => total + option.prix, 0);
  }

  // Méthodes supplémentaires pour le CRUD des options

  async getOptionsByType(type: string): Promise<OptionSupplementaire[]> {
    return this.optionModel.find({ type, disponible: true }).exec();
  }

  async getPopularOptions(): Promise<OptionSupplementaire[]> {
    // Dans un environnement réel, vous pourriez avoir une logique pour déterminer les options populaires
    // Ici, on retourne simplement les 5 premières options disponibles
    return this.optionModel.find({ disponible: true }).limit(5).exec();
  }

  async createOption(
    optionData: Partial<OptionSupplementaire>,
  ): Promise<OptionSupplementaire> {
    const newOption = new this.optionModel(optionData);
    return newOption.save();
  }

  async updateOption(
    id: string,
    optionData: Partial<OptionSupplementaire>,
  ): Promise<OptionSupplementaire> {
    const option = await this.optionModel.findById(id);
    if (!option) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }

    const updatedOption = await this.optionModel
      .findByIdAndUpdate(id, optionData, { new: true })
      .exec();

    if (!updatedOption) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }

    return updatedOption;
  }

  async toggleOptionAvailability(
    id: string,
    disponible: boolean,
  ): Promise<OptionSupplementaire> {
    const option = await this.optionModel.findById(id);
    if (!option) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }

    const updatedOption = await this.optionModel
      .findByIdAndUpdate(id, { disponible }, { new: true })
      .exec();

    if (!updatedOption) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }

    return updatedOption;
  }

  async deleteOption(id: string): Promise<{ message: string }> {
    const option = await this.optionModel.findById(id);
    if (!option) {
      throw new NotFoundException(`Option avec l'ID ${id} non trouvée`);
    }

    await this.optionModel.findByIdAndDelete(id);
    return { message: 'Option supprimée avec succès' };
  }
}
