import { Express } from 'express';
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @Roles('gérant')
  @UseInterceptors(FilesInterceptor('images', 10)) // Limite à 10 images
  async createVehicle(
    @Body(ValidationPipe) createVehicleDto: CreateVehicleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.vehiclesService.createVehicle(createVehicleDto, files);
  }

  @Put(':id/status')
  @Roles('gérant')
  async updateVehicleStatus(
    @Param('id') id: string,
    @Body('disponibilite') disponibilite: boolean,
  ) {
    return this.vehiclesService.updateVehicleStatus(id, disponibilite);
  }

  @Get()
  async getAllVehicles() {
    return this.vehiclesService.getAllVehicles();
  }

  @Get(':id')
  async getVehicleById(@Param('id') id: string) {
    return this.vehiclesService.getVehicleById(id);
  }

  @Get(':id/images')
  async getVehicleImages(@Param('id') id: string) {
    return this.vehiclesService.getVehicleImages(id);
  }

  @Delete(':id')
  @Roles('gérant')
  async deleteVehicle(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id);
  }

  @Put(':id/deactivate')
  @Roles('gérant')
  async deactivateVehicle(@Param('id') id: string) {
    return this.vehiclesService.deactivateVehicle(id);
  }

  @Put(':id')
  @Roles('gérant')
  @UseInterceptors(FilesInterceptor('images', 10)) // Limite à 10 images
  async updateVehicle(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVehicleDto: UpdateVehicleDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.vehiclesService.updateVehicle(id, updateVehicleDto, files);
  }
}
