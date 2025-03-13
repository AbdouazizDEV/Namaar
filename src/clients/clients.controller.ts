// src/clients/clients.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('gérant')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async getAllClients() {
    return this.clientsService.getAllClients();
  }

  @Get('stats')
  async getClientStats() {
    return this.clientsService.getClientStats();
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.clientsService.getClientById(id);
  }

  @Put(':id/status')
  async updateClientStatus(
    @Param('id') id: string,
    @Body() updateClientStatusDto: UpdateClientStatusDto,
  ) {
    return this.clientsService.updateClientStatus(id, updateClientStatusDto);
  }
}
