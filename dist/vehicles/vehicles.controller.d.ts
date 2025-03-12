import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    createVehicle(createVehicleDto: CreateVehicleDto, files: Express.Multer.File[]): Promise<import("../schemas/voiture.schema").Voiture>;
    updateVehicleStatus(id: string, disponibilite: boolean): Promise<import("../schemas/voiture.schema").Voiture>;
    getAllVehicles(): Promise<import("../schemas/voiture.schema").Voiture[]>;
    getVehicleById(id: string): Promise<import("../schemas/voiture.schema").Voiture>;
    getVehicleImages(id: string): Promise<import("../schemas/image.schema").Image[]>;
    deleteVehicle(id: string): Promise<{
        message: string;
    }>;
    deactivateVehicle(id: string): Promise<import("../schemas/voiture.schema").Voiture>;
    updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto, files?: Express.Multer.File[]): Promise<import("../schemas/voiture.schema").Voiture>;
}
