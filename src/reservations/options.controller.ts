// src/reservations/options.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OptionsService } from './options.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OptionSupplementaire } from '../schemas/option-supplementaire.schema';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  // Endpoints accessibles à tous les utilisateurs authentifiés
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllOptions() {
    return this.optionsService.getAllOptions();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOptionById(@Param('id') id: string) {
    return this.optionsService.getOptionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('type/:type')
  async getOptionsByType(@Param('type') type: string) {
    return this.optionsService.getOptionsByType(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('popular')
  async getPopularOptions() {
    return this.optionsService.getPopularOptions();
  }

  // Endpoints réservés au gérant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gérant')
  @Post()
  async createOption(@Body() optionData: Partial<OptionSupplementaire>) {
    return this.optionsService.createOption(optionData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gérant')
  @Put(':id')
  async updateOption(
    @Param('id') id: string,
    @Body() optionData: Partial<OptionSupplementaire>,
  ) {
    return this.optionsService.updateOption(id, optionData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gérant')
  @Put(':id/availability')
  async toggleOptionAvailability(
    @Param('id') id: string,
    @Body('disponible') disponible: boolean,
  ) {
    return this.optionsService.toggleOptionAvailability(id, disponible);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gérant')
  @Delete(':id')
  async deleteOption(@Param('id') id: string) {
    return this.optionsService.deleteOption(id);
  }
}
