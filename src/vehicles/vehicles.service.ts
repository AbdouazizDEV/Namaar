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
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Inject, forwardRef } from '@nestjs/common';
import { FavorisService } from '../favoris/favoris.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => FavorisService))
    private readonly favorisService: FavorisService,
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

    const ancienStatut = vehicle.disponibilite;
    vehicle.disponibilite = status;
    await vehicle.save();

    // Notifier seulement si le statut a changé
    if (ancienStatut !== status) {
      await this.favorisService.notifierChangementDisponibilite(id, status);
    }

    return vehicle;
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
  async updateVehicle(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
    files?: Express.Multer.File[],
  ): Promise<Voiture> {
    const vehicle = await this.voitureModel.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    // Mettre à jour les propriétés
    Object.assign(vehicle, updateVehicleDto);

    // Si des nouvelles images sont fournies
    if (files && files.length > 0) {
      // Upload des images sur Cloudinary
      const uploadResults =
        await this.cloudinaryService.uploadMultipleImages(files);

      // Récupérer les URLs des images
      const imageUrls = uploadResults.map((result) => result.secure_url);

      // Mettre à jour l'image principale dans le document voiture
      vehicle.images = [imageUrls[0]];

      // Créer les entrées dans la table Image pour chaque nouvelle image
      const imagePromises = uploadResults.map((result, index) => {
        const imageDoc = new this.imageModel({
          voiture_id: vehicle._id,
          chemin: result.secure_url,
          est_principale: index === 0, // La première image est l'image principale
          date_ajout: new Date(),
        });
        return imageDoc.save();
      });

      await Promise.all(imagePromises);
      if (updateVehicleDto.prix_location !== undefined && 
        vehicle.prix_location !== updateVehicleDto.prix_location) {
        const ancienPrix = vehicle.prix_location;
        const nouveauPrix = updateVehicleDto.prix_location;

        // Après avoir sauvegardé le véhicule
        await this.favorisService.notifierChangementPrix(id, ancienPrix, nouveauPrix);
      }
    }

    return vehicle.save();
  }
  async deactivateVehicle(id: string): Promise<Voiture> {
    const vehicle = await this.voitureModel.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    vehicle.disponibilite = false;
    return vehicle.save();
  }
}
