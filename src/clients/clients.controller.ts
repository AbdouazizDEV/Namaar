// src/clients/clients.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiProperty,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

// Classes pour documenter les réponses
class ClientDto {
  @ApiProperty({ example: '6072f329a01c7d001bcf7812' })
  _id: string;

  @ApiProperty({ example: '6072f329a01c7d001bcf7813' })
  utilisateur_id: string;

  @ApiProperty({ example: '01 23 45 67 89' })
  telephone: string;

  @ApiProperty({ example: '123 Avenue de la République, 75011 Paris' })
  adresse: string;

  @ApiProperty({ example: 'actif' })
  statut: string;

  @ApiProperty({ example: 'standard' })
  type: string;
}

class ClientWithUserDto extends ClientDto {
  @ApiProperty({
    example: {
      _id: '6072f329a01c7d001bcf7813',
      nom: 'Ngoor',
      prenom: 'FAYE',
      email: 'FAYE.Ngoor@example.com',
    },
  })
  utilisateur_id: any;
}

class ClientStatsDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 120 })
  actifs: number;

  @ApiProperty({ example: 30 })
  inactifs: number;

  @ApiProperty({ example: 45 })
  nouveauxCeMois: number;

  @ApiProperty({ example: 15 })
  tauxCroissance: number;
}

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('gérant')
@ApiBearerAuth('access-token')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les clients' })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les clients récupérée avec succès.',
    type: [ClientWithUserDto],
  })
  async getAllClients() {
    return this.clientsService.getAllClients();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des clients' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques clients récupérées avec succès.',
    type: ClientStatsDto,
  })
  async getClientStats() {
    return this.clientsService.getClientStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un client par son ID' })
  @ApiParam({ name: 'id', description: 'ID du client', type: String })
  @ApiResponse({
    status: 200,
    description: 'Client récupéré avec succès.',
    type: ClientWithUserDto,
  })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  async getClientById(@Param('id') id: string) {
    return this.clientsService.getClientById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: "'Mettre à jour le statut d'un client'" })
  @ApiParam({ name: 'id', description: 'ID du client', type: String })
  @ApiBody({ type: UpdateClientStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Statut du client mis à jour avec succès.',
    type: ClientDto,
  })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  async updateClientStatus(
    @Param('id') id: string,
    @Body() updateClientStatusDto: UpdateClientStatusDto,
  ) {
    return this.clientsService.updateClientStatus(id, updateClientStatusDto);
  }
}
