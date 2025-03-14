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

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('gérant', 'admin') // Assurez-vous que ces rôles correspondent à ceux définis dans votre application
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Query() requestDto: DashboardRequestDto): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(requestDto);
  }

  @Get('statistiques')
  async getStatistiques(@Query() requestDto: DashboardRequestDto): Promise<StatistiquesPeriodeDto> {
    return this.dashboardService.getStatistiques(requestDto);
  }

  @Get('performance')
  async getIndicateursPerformance(@Query() requestDto: DashboardRequestDto): Promise<IndicateursPerformanceDto> {
    return this.dashboardService.getIndicateursPerformance(requestDto);
  }

  @Get('alertes')
  async getAlertes(): Promise<AlertesDto> {
    return this.dashboardService.getAlertes();
  }

  @Post('alertes/:id/traiter')
  async marquerAlerteTraitee(@Param('id') alerteId: string): Promise<AlertesDto> {
    return this.dashboardService.marquerAlerteTraitee(alerteId);
  }
  
  @Get('revenus-mensuels')
  async getRevenusMensuels(@Query() requestDto: DashboardRequestDto): Promise<any> {
    return this.dashboardService.getRevenusMensuels(requestDto);
  }
  
  @Get('taux-occupation')
  async getTauxOccupation(@Query() requestDto: DashboardRequestDto): Promise<any> {
    return this.dashboardService.getTauxOccupation(requestDto);
  }
  
  @Get('voitures-performances')
  async getVoituresPerformances(@Query() requestDto: DashboardRequestDto): Promise<any> {
    return this.dashboardService.getVoituresPerformances(requestDto);
  }
  
  @Get('clients-actifs')
  async getClientsActifs(@Query() requestDto: DashboardRequestDto): Promise<any> {
    return this.dashboardService.getClientsActifs(requestDto);
  }
}