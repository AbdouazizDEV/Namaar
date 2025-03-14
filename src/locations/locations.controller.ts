// src/locations/locations.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { StartContractDto } from './dto/start-contract.dto';
import { EndContractDto } from './dto/end-contract.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express';

// Interface pour les données de test
interface TestInvoiceData {
  reservation_id: string;
  client_id: string;
  montant_total?: number;
}

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getAllLocations() {
    return this.locationsService.getAllLocations();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getLocationById(@Param('id') id: string) {
    return this.locationsService.getLocationById(id);
  }

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async startContract(
    @Body(ValidationPipe) startContractDto: StartContractDto,
  ) {
    return this.locationsService.startContract(startContractDto);
  }

  @Put(':id/end')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async endContract(
    @Param('id') id: string,
    @Body(ValidationPipe) endContractDto: EndContractDto,
  ) {
    return this.locationsService.endContract(id, endContractDto);
  }

  @Post('reservations/:reservationId/payments')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async createPayment(
    @Param('reservationId') reservationId: string,
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ) {
    return this.locationsService.createPayment(reservationId, createPaymentDto);
  }

  @Get('factures')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getAllInvoices() {
    return this.locationsService.getInvoices();
  }

  @Get('factures/client/:clientId')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getClientInvoices(@Param('clientId') clientId: string) {
    return this.locationsService.getInvoices(clientId);
  }

  @Get('factures/:id')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getInvoiceById(@Param('id') id: string) {
    return this.locationsService.getInvoiceById(id);
  }

  @Get('paiements')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getAllPayments() {
    return this.locationsService.getPayments();
  }

  @Get('factures/:factureId/paiements')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getInvoicePayments(@Param('factureId') factureId: string) {
    return this.locationsService.getPayments(factureId);
  }

  @Get('factures/:id/pdf')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async generateInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfPath = await this.locationsService.generateInvoicePdf(id);

    // Renvoyer le fichier PDF directement au navigateur
    return res.sendFile(pdfPath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
      },
    });
  }

  @Post('factures/:id/send-email')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async sendInvoiceByEmail(
    @Param('id') id: string,
    @Body() emailData: { email?: string },
  ) {
    return this.locationsService.sendInvoiceByEmail(id, emailData.email);
  }

  // Déplacé vers le service
  @Post('test/create-invoice')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async createTestInvoice(@Body() testData: TestInvoiceData) {
    return this.locationsService.createTestInvoice(testData);
  }
}
