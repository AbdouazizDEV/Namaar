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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const voiture_schema_1 = require("../schemas/voiture.schema");
const image_schema_1 = require("../schemas/image.schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const common_2 = require("@nestjs/common");
const favoris_service_1 = require("../favoris/favoris.service");
let VehiclesService = class VehiclesService {
    constructor(voitureModel, imageModel, cloudinaryService, favorisService) {
        this.voitureModel = voitureModel;
        this.imageModel = imageModel;
        this.cloudinaryService = cloudinaryService;
        this.favorisService = favorisService;
    }
    async createVehicle(createVehicleDto, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Au moins une image est requise');
        }
        const uploadResults = await this.cloudinaryService.uploadMultipleImages(files);
        const imageUrls = uploadResults.map((result) => result.secure_url);
        const newVehicle = new this.voitureModel({
            ...createVehicleDto,
            disponibilite: createVehicleDto.disponibilite ?? true,
            images: [imageUrls[0]],
        });
        const savedVehicle = await newVehicle.save();
        const imagePromises = uploadResults.map((result, index) => {
            const imageDoc = new this.imageModel({
                voiture_id: savedVehicle._id,
                chemin: result.secure_url,
                est_principale: index === 0,
                date_ajout: new Date(),
            });
            return imageDoc.save();
        });
        await Promise.all(imagePromises);
        return savedVehicle;
    }
    async updateVehicleStatus(id, status) {
        const vehicle = await this.voitureModel.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        const ancienStatut = vehicle.disponibilite;
        vehicle.disponibilite = status;
        await vehicle.save();
        if (ancienStatut !== status) {
            await this.favorisService.notifierChangementDisponibilite(id, status);
        }
        return vehicle;
    }
    async getAllVehicles() {
        return this.voitureModel.find().exec();
    }
    async getVehicleById(id) {
        const vehicle = await this.voitureModel.findById(id).exec();
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return vehicle;
    }
    async getVehicleImages(id) {
        const images = await this.imageModel.find({ voiture_id: id }).exec();
        if (!images || images.length === 0) {
            throw new common_1.NotFoundException(`Aucune image trouvée pour le véhicule avec l'ID ${id}`);
        }
        return images;
    }
    async deleteVehicle(id) {
        const images = await this.imageModel.find({ voiture_id: id }).exec();
        await this.imageModel.deleteMany({ voiture_id: id }).exec();
        const deleteResult = await this.voitureModel.findByIdAndDelete(id).exec();
        if (!deleteResult) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return { message: 'Véhicule et images associées supprimés avec succès' };
    }
    async updateVehicle(id, updateVehicleDto, files) {
        const vehicle = await this.voitureModel.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        Object.assign(vehicle, updateVehicleDto);
        if (files && files.length > 0) {
            const uploadResults = await this.cloudinaryService.uploadMultipleImages(files);
            const imageUrls = uploadResults.map((result) => result.secure_url);
            vehicle.images = [imageUrls[0]];
            const imagePromises = uploadResults.map((result, index) => {
                const imageDoc = new this.imageModel({
                    voiture_id: vehicle._id,
                    chemin: result.secure_url,
                    est_principale: index === 0,
                    date_ajout: new Date(),
                });
                return imageDoc.save();
            });
            await Promise.all(imagePromises);
            if (updateVehicleDto.prix_location !== undefined &&
                vehicle.prix_location !== updateVehicleDto.prix_location) {
                const ancienPrix = vehicle.prix_location;
                const nouveauPrix = updateVehicleDto.prix_location;
                await this.favorisService.notifierChangementPrix(id, ancienPrix, nouveauPrix);
            }
        }
        return vehicle.save();
    }
    async deactivateVehicle(id) {
        const vehicle = await this.voitureModel.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        vehicle.disponibilite = false;
        return vehicle.save();
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(1, (0, mongoose_1.InjectModel)(image_schema_1.Image.name)),
    __param(3, (0, common_2.Inject)((0, common_2.forwardRef)(() => favoris_service_1.FavorisService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        cloudinary_service_1.CloudinaryService,
        favoris_service_1.FavorisService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map