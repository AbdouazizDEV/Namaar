import { OptionsService } from './options.service';
import { OptionSupplementaire } from '../schemas/option-supplementaire.schema';
export declare class OptionsController {
    private readonly optionsService;
    constructor(optionsService: OptionsService);
    getAllOptions(): Promise<OptionSupplementaire[]>;
    getOptionById(id: string): Promise<OptionSupplementaire>;
    getOptionsByType(type: string): Promise<OptionSupplementaire[]>;
    getPopularOptions(): Promise<OptionSupplementaire[]>;
    createOption(optionData: Partial<OptionSupplementaire>): Promise<OptionSupplementaire>;
    updateOption(id: string, optionData: Partial<OptionSupplementaire>): Promise<OptionSupplementaire>;
    toggleOptionAvailability(id: string, disponible: boolean): Promise<OptionSupplementaire>;
    deleteOption(id: string): Promise<{
        message: string;
    }>;
}
