import { Express } from 'express';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';
import { Image, ImageDocument } from '../schemas/image.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createVehicle(
    createVehicleDto: CreateVehicleDto,
    files: Express.Multer.File[],
  ): Promise<Voiture> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Au moins une image est requise');
    }

    // Upload des images sur Cloudinary
    const uploadResults =
      await this.cloudinaryService.uploadMultipleImages(files);

    // Récupérer les URLs des images
    const imageUrls = uploadResults.map(
      (result) => result.secure_url as string,
    );

    // Créer le véhicule
    const newVehicle = new this.voitureModel({
      ...createVehicleDto,
      disponibilite: createVehicleDto.disponibilite ?? true,
      images: [imageUrls[0]], // Stocker la première image dans le document voiture
    });

    const savedVehicle = await newVehicle.save();

    // Créer les entrées dans la table Image pour chaque image
    const imagePromises = uploadResults.map((result, index) => {
      const imageDoc = new this.imageModel({
        voiture_id: savedVehicle._id,
        chemin: result.secure_url as string,
        est_principale: index === 0, // La première image est l'image principale
        date_ajout: new Date(),
      });
      return imageDoc.save();
    });

    await Promise.all(imagePromises);

    return savedVehicle;
  }

  async updateVehicleStatus(id: string, status: boolean): Promise<Voiture> {
    const vehicle = await this.voitureModel.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    vehicle.disponibilite = status;
    return vehicle.save();
  }

  async getAllVehicles(): Promise<Voiture[]> {
    return this.voitureModel.find().exec();
  }

  async getVehicleById(id: string): Promise<Voiture> {
    const vehicle = await this.voitureModel.findById(id).exec();

    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    return vehicle;
  }

  async getVehicleImages(id: string): Promise<Image[]> {
    const images = await this.imageModel.find({ voiture_id: id }).exec();

    if (!images || images.length === 0) {
      throw new NotFoundException(
        `Aucune image trouvée pour le véhicule avec l'ID ${id}`,
      );
    }

    return images;
  }

  async deleteVehicle(id: string): Promise<{ message: string }> {
    // Récupérer les images associées au véhicule
    const images = await this.imageModel.find({ voiture_id: id }).exec();

    // Supprimer les images de Cloudinary
    // Note: Pour faire cela correctement, il faudrait stocker les public_ids de Cloudinary
    // Pour simplifier, nous supprimons simplement les entrées de la base de données

    // Supprimer les entrées d'images de la base de données
    await this.imageModel.deleteMany({ voiture_id: id }).exec();

    // Supprimer le véhicule
    const deleteResult = await this.voitureModel.findByIdAndDelete(id).exec();

    if (!deleteResult) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    return { message: 'Véhicule et images associées supprimés avec succès' };
  }
}
