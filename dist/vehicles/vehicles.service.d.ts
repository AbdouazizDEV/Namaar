import { Model } from 'mongoose';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';
import { Image, ImageDocument } from '../schemas/image.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class VehiclesService {
    private voitureModel;
    private imageModel;
    private cloudinaryService;
    constructor(voitureModel: Model<VoitureDocument>, imageModel: Model<ImageDocument>, cloudinaryService: CloudinaryService);
    createVehicle(createVehicleDto: CreateVehicleDto, files: Express.Multer.File[]): Promise<Voiture>;
    updateVehicleStatus(id: string, status: boolean): Promise<Voiture>;
    getAllVehicles(): Promise<Voiture[]>;
    getVehicleById(id: string): Promise<Voiture>;
    getVehicleImages(id: string): Promise<Image[]>;
    deleteVehicle(id: string): Promise<{
        message: string;
    }>;
    updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto, files?: Express.Multer.File[]): Promise<Voiture>;
    deactivateVehicle(id: string): Promise<Voiture>;
}
