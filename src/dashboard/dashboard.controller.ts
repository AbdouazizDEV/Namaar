// src/dashboard/dashboard.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { StatistiquesPeriodeDto } from './dto/statistiques-periode.dto';
import { IndicateursPerformanceDto } from './dto/indicateurs-performance.dto';
import { AlertesDto } from './dto/alerte.dto';
import { DashboardRequestDto } from './dto/dashboard-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiProperty,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';

// Classe pour documenter les réponses additionnelles
class RevenusMensuelsDto {
  @ApiProperty({
    example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    description: 'Labels des mois',
  })
  labels: string[];

  @ApiProperty({
    example: [120000, 150000, 130000, 180000, 200000],
    description: 'Revenus mensuels en FCFA',
  })
  revenus: number[];

  @ApiProperty({ example: 156000, description: 'Revenu mensuel moyen en FCFA' })
  moyenneMensuelle: number;
}

class TauxOccupationDto {
  @ApiProperty({
    example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    description: 'Labels des mois',
  })
  labels: string[];

  @ApiProperty({
    example: [65.3, 70.2, 62.5, 72.8, 68.1],
    description: "'Taux d'occupation en pourcentage'",
  })
  tauxOccupation: number[];

  @ApiProperty({
    example: 67.8,
    description: "'Taux d'occupation moyen en pourcentage'",
  })
  moyenneOccupation: number;
}

class VoituresPerformanceDto {
  @ApiProperty({
    example: [
      { id: '123', marque: 'Toyota', modele: 'Corolla', performance: 85.2 },
      { id: '124', marque: 'Renault', modele: 'Clio', performance: 72.1 },
    ],
    description: 'Performance des véhicules',
  })
  vehicules: any[];

  @ApiProperty({
    example: 78.6,
    description: 'Performance moyenne en pourcentage',
  })
  moyennePerformance: number;
}

class ClientsActifsDto {
  @ApiProperty({
    example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    description: 'Labels des mois',
  })
  labels: string[];

  @ApiProperty({
    example: [120, 132, 128, 145, 152],
    description: 'Nombre de clients actifs par mois',
  })
  clientsActifs: number[];

  @ApiProperty({
    example: 12.5,
    description: 'Taux de croissance en pourcentage',
  })
  tauxCroissance: number;
}

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('gérant', 'admin')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: "'Récupérer une vue d'ensemble du tableau de bord'",
  })
  @ApiResponse({
    status: 200,
    description: "'Vue d'ensemble récupérée avec succès'",
    type: DashboardOverviewDto,
  })
  async getOverview(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(requestDto);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Récupérer les statistiques par période' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    type: StatistiquesPeriodeDto,
  })
  async getStatistiques(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<StatistiquesPeriodeDto> {
    return this.dashboardService.getStatistiques(requestDto);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Récupérer les indicateurs de performance' })
  @ApiResponse({
    status: 200,
    description: 'Indicateurs de performance récupérés avec succès',
    type: IndicateursPerformanceDto,
  })
  async getIndicateursPerformance(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<IndicateursPerformanceDto> {
    return this.dashboardService.getIndicateursPerformance(requestDto);
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Récupérer toutes les alertes' })
  @ApiResponse({
    status: 200,
    description: 'Alertes récupérées avec succès',
    type: AlertesDto,
  })
  async getAlertes(): Promise<AlertesDto> {
    return this.dashboardService.getAlertes();
  }

  @Post('alertes/:id/traiter')
  @ApiOperation({ summary: 'Marquer une alerte comme traitée' })
  @ApiParam({
    name: 'id',
    description: "'Identifiant de l'alerte'",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Alerte marquée comme traitée avec succès',
    type: AlertesDto,
  })
  async marquerAlerteTraitee(
    @Param('id') alerteId: string,
  ): Promise<AlertesDto> {
    return this.dashboardService.marquerAlerteTraitee(alerteId);
  }

  @Get('revenus-mensuels')
  @ApiOperation({ summary: 'Récupérer les revenus mensuels' })
  @ApiResponse({
    status: 200,
    description: 'Revenus mensuels récupérés avec succès',
    type: RevenusMensuelsDto,
  })
  async getRevenusMensuels(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<any> {
    return this.dashboardService.getRevenusMensuels(requestDto);
  }

  @Get('taux-occupation')
  @ApiOperation({ summary: "'Récupérer le taux d'occupation des véhicules'" })
  @ApiResponse({
    status: 200,
    description: "'Taux d'occupation récupéré avec succès'",
    type: TauxOccupationDto,
  })
  async getTauxOccupation(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<any> {
    return this.dashboardService.getTauxOccupation(requestDto);
  }

  @Get('voitures-performances')
  @ApiOperation({ summary: 'Récupérer les performances des véhicules' })
  @ApiResponse({
    status: 200,
    description: 'Performances des véhicules récupérées avec succès',
    type: VoituresPerformanceDto,
  })
  async getVoituresPerformances(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<any> {
    return this.dashboardService.getVoituresPerformances(requestDto);
  }

  @Get('clients-actifs')
  @ApiOperation({
    summary: 'Récupérer les statistiques sur les clients actifs',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des clients actifs récupérées avec succès',
    type: ClientsActifsDto,
  })
  async getClientsActifs(
    @Query() requestDto: DashboardRequestDto,
  ): Promise<any> {
    return this.dashboardService.getClientsActifs(requestDto);
  }
}
