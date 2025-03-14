// src/public/public.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { Public } from '../auth/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('vehicles')
  async getAllVehicles(@Query() searchDto: SearchVehiclesDto) {
    return this.publicService.searchVehicles(searchDto);
  }

  @Public()
  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Obtenir les détails d\'un véhicule' })
  @ApiParam({ name: 'id', description: 'ID du véhicule' })
  @ApiResponse({ status: 200, description: 'Détails du véhicule' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async getVehicleDetails(@Param('id') id: string) {
    const vehicle = await this.publicService.getVehicleDetails(id);
    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }
    return vehicle;
  }

  @Public()
  @Get('vehicles/:id/availability')
  @ApiOperation({ summary: 'Obtenir la disponibilité d\'un véhicule' })
  @ApiParam({ name: 'id', description: 'ID du véhicule' })
  @ApiQuery({ name: 'dateDebut', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Disponibilité du véhicule' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async getVehicleAvailability(
    @Param('id') id: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    const availability = await this.publicService.getVehicleAvailability(
      id,
      dateDebut ? new Date(dateDebut) : undefined,
      dateFin ? new Date(dateFin) : undefined,
    );
    return availability;
  }

  @Public()
  @Get('vehicles/:id/images')
  @ApiOperation({ summary: 'Obtenir les images d\'un véhicule' })
  @ApiParam({ name: 'id', description: 'ID du véhicule' })
  @ApiResponse({ status: 200, description: 'Images du véhicule' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async getVehicleImages(@Param('id') id: string) {
    const images = await this.publicService.getVehicleImages(id);
    if (!images || images.length === 0) {
      throw new NotFoundException(`Aucune image trouvée pour le véhicule avec l'ID ${id}`);
    }
    return images;
  }

  @Public()
  @Get('offers')
  @ApiOperation({ summary: 'Obtenir toutes les offres actives' })
  @ApiResponse({ status: 200, description: 'Liste des offres actives' })
  async getActiveOffers() {
    return this.publicService.getActiveOffers();
  }

  @Public()
  @Get('offers/:id')
  @ApiOperation({ summary: 'Obtenir les détails d\'une offre' })
  @ApiParam({ name: 'id', description: 'ID de l\'offre' })
  @ApiResponse({ status: 200, description: 'Détails de l\'offre' })
  @ApiResponse({ status: 404, description: 'Offre non trouvée' })
  async getOfferDetails(@Param('id') id: string) {
    const offer = await this.publicService.getOfferDetails(id);
    if (!offer) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    return offer;
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Rechercher des véhicules avec filtres' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  async searchVehicles(@Query() searchDto: SearchVehiclesDto) {
    return this.publicService.searchVehicles(searchDto);
  }
}
