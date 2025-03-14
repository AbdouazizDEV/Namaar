import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { StatistiquesPeriodeDto } from './dto/statistiques-periode.dto';
import { IndicateursPerformanceDto } from './dto/indicateurs-performance.dto';
import { AlertesDto } from './dto/alerte.dto';
import { DashboardRequestDto } from './dto/dashboard-request.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(requestDto: DashboardRequestDto): Promise<DashboardOverviewDto>;
    getStatistiques(requestDto: DashboardRequestDto): Promise<StatistiquesPeriodeDto>;
    getIndicateursPerformance(requestDto: DashboardRequestDto): Promise<IndicateursPerformanceDto>;
    getAlertes(): Promise<AlertesDto>;
    marquerAlerteTraitee(alerteId: string): Promise<AlertesDto>;
    getRevenusMensuels(requestDto: DashboardRequestDto): Promise<any>;
    getTauxOccupation(requestDto: DashboardRequestDto): Promise<any>;
    getVoituresPerformances(requestDto: DashboardRequestDto): Promise<any>;
    getClientsActifs(requestDto: DashboardRequestDto): Promise<any>;
}
