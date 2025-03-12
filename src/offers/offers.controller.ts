// src/offers/offers.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FilterOffersDto } from './dto/filter-offers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @Roles('gérant')
  async createOffer(@Body(ValidationPipe) createOfferDto: CreateOfferDto) {
    return this.offersService.createOffer(createOfferDto);
  }

  @Get()
  async getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get('active')
  async getActiveOffers() {
    return this.offersService.getActiveOffers();
  }

  @Get('filter')
  async filterOffers(@Query(ValidationPipe) filterDto: FilterOffersDto) {
    return this.offersService.filterOffers(filterDto);
  }

  @Get(':id')
  async getOfferById(@Param('id') id: string) {
    return this.offersService.getOfferById(id);
  }

  @Put(':id')
  @Roles('gérant')
  async updateOffer(
    @Param('id') id: string,
    @Body(ValidationPipe) updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.updateOffer(id, updateOfferDto);
  }

  @Delete(':id')
  @Roles('gérant')
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.deleteOffer(id);
  }
}
