// src/favoris/favoris.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { FavorisService } from './favoris.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateFavoriVoitureDto,
  CreateFavoriOffreDto,
} from './dto/create-favori.dto';
import { GetFavorisDto } from './dto/get-favoris.dto';

@Controller('favoris')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Get('voitures')
  @Roles('client')
  async getFavorisVoitures(@Req() req, @Query() query: GetFavorisDto) {
    const userId = req.user._id;
    return this.favorisService.getFavorisVoitures(userId, query.populateDetails);
  }

  @Post('voitures')
  @Roles('client')
  async addFavoriVoiture(
    @Req() req,
    @Body() createFavoriDto: CreateFavoriVoitureDto,
  ) {
    console.log('req.user:', req.user);
    const userId = req.user._id || req.user.id || req.user._id; // Essayez différentes variantes
    console.log('userId extrait:', userId);
    return this.favorisService.addFavoriVoiture(userId, createFavoriDto.voiture_id);
  }

  @Delete('voitures/:id')
  @Roles('client')
  async removeFavoriVoiture(@Req() req, @Param('id') voitureId: string) {
    const userId = req.user.userId;
    return this.favorisService.removeFavoriVoiture(userId, voitureId);
  }

  @Get('voitures/check/:id')
  @Roles('client')
  async checkVoitureFavori(@Req() req, @Param('id') voitureId: string) {
    const userId = req.user._id;
    return this.favorisService.checkVoitureFavori(userId, voitureId);
  }

  @Get('offres')
  @Roles('client')
  async getFavorisOffres(@Req() req, @Query() query: GetFavorisDto) {
    const userId = req.user._id;
    return this.favorisService.getFavorisOffres(userId, query.populateDetails);
  }

  @Post('offres')
  @Roles('client')
  async addFavoriOffre(@Req() req, @Body() createFavoriDto: CreateFavoriOffreDto) {
    const userId = req.user._id;
    return this.favorisService.addFavoriOffre(userId, createFavoriDto.offre_id);
  }

  @Delete('offres/:id')
  @Roles('client')
  async removeFavoriOffre(@Req() req, @Param('id') offreId: string) {
    const userId = req.user._id;
    return this.favorisService.removeFavoriOffre(userId, offreId);
  }

  @Get('offres/check/:id')
  @Roles('client')
  async checkOffreFavori(@Req() req, @Param('id') offreId: string) {
    const userId = req.user._id;
    return this.favorisService.checkOffreFavori(userId, offreId);
  }

  @Get('notifications')
  @Roles('client')
  async getNotifications(@Req() req) {
    const userId = req.user._id;
    return this.favorisService.getNotifications(userId);
  }

  @Post('notifications/:id/marquer-lu')
  @Roles('client')
  async marquerNotificationLue(@Req() req, @Param('id') notificationId: string) {
    const userId = req.user._id;
    return this.favorisService.marquerNotificationLue(userId, notificationId);
  }

  @Post('notifications/marquer-tout-lu')
  @Roles('client')
  async marquerToutesNotificationsLues(@Req() req) {
    const userId = req.user._id;
    return this.favorisService.marquerToutesNotificationsLues(userId);
  }

  @Delete('notifications/:id')
  @Roles('client')
  async supprimerNotification(@Req() req, @Param('id') notificationId: string) {
    const userId = req.user._id;
    return this.favorisService.supprimerNotification(userId, notificationId);
  }

  @Delete('notifications')
  @Roles('client')
  async supprimerToutesNotifications(@Req() req) {
    const userId = req.user._id;
    return this.favorisService.supprimerToutesNotifications(userId);
  }
}
