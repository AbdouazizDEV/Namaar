import { Model } from 'mongoose';
import { OptionSupplementaire, OptionSupplementaireDocument } from '../schemas/option-supplementaire.schema';
export declare class OptionsService {
    private optionModel;
    constructor(optionModel: Model<OptionSupplementaireDocument>);
    getAllOptions(): Promise<OptionSupplementaire[]>;
    getOptionById(id: string): Promise<OptionSupplementaire>;
    calculerPrixOptions(optionsIds: string[]): Promise<number>;
    getOptionsByType(type: string): Promise<OptionSupplementaire[]>;
    getPopularOptions(): Promise<OptionSupplementaire[]>;
    createOption(optionData: Partial<OptionSupplementaire>): Promise<OptionSupplementaire>;
    updateOption(id: string, optionData: Partial<OptionSupplementaire>): Promise<OptionSupplementaire>;
    toggleOptionAvailability(id: string, disponible: boolean): Promise<OptionSupplementaire>;
    deleteOption(id: string): Promise<{
        message: string;
    }>;
}
