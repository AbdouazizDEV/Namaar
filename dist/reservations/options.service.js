"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const option_supplementaire_schema_1 = require("../schemas/option-supplementaire.schema");
let OptionsService = class OptionsService {
    constructor(optionModel) {
        this.optionModel = optionModel;
    }
    async getAllOptions() {
        return this.optionModel.find({ disponible: true }).exec();
    }
    async getOptionById(id) {
        const option = await this.optionModel.findById(id).exec();
        if (!option) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        return option;
    }
    async calculerPrixOptions(optionsIds) {
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
    async getOptionsByType(type) {
        return this.optionModel.find({ type, disponible: true }).exec();
    }
    async getPopularOptions() {
        return this.optionModel.find({ disponible: true }).limit(5).exec();
    }
    async createOption(optionData) {
        const newOption = new this.optionModel(optionData);
        return newOption.save();
    }
    async updateOption(id, optionData) {
        const option = await this.optionModel.findById(id);
        if (!option) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        const updatedOption = await this.optionModel
            .findByIdAndUpdate(id, optionData, { new: true })
            .exec();
        if (!updatedOption) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        return updatedOption;
    }
    async toggleOptionAvailability(id, disponible) {
        const option = await this.optionModel.findById(id);
        if (!option) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        const updatedOption = await this.optionModel
            .findByIdAndUpdate(id, { disponible }, { new: true })
            .exec();
        if (!updatedOption) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        return updatedOption;
    }
    async deleteOption(id) {
        const option = await this.optionModel.findById(id);
        if (!option) {
            throw new common_1.NotFoundException(`Option avec l'ID ${id} non trouvée`);
        }
        await this.optionModel.findByIdAndDelete(id);
        return { message: 'Option supprimée avec succès' };
    }
};
exports.OptionsService = OptionsService;
exports.OptionsService = OptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(option_supplementaire_schema_1.OptionSupplementaire.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OptionsService);
//# sourceMappingURL=options.service.js.map