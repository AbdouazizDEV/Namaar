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
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PaymentService } from './payment.service';
import { OptionsService } from './options.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
import {
  ReservationStepDto,
  OptionsSelectionDto,
  PaymentDto,
} from './dto/reservation-step.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(
    private reservationsService: ReservationsService,
    private paymentService: PaymentService,
    private optionsService: OptionsService,
  ) {}

  // Endpoints existants pour les fonctionnalités de base

  @Post()
  async createReservation(
    @Request() req,
    @Body(ValidationPipe) createReservationDto: CreateReservationDto,
  ) {
    // Si c'est un gérant et qu'il spécifie un utilisateur_id
    if (req.user.role === 'gérant' && createReservationDto.utilisateur_id) {
      return this.reservationsService.createReservation(req.user._id, createReservationDto, true);
    }

    // Pour les clients normaux (ou gérants sans spécifier de client)
    return this.reservationsService.createReservation(req.user._id, createReservationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getAllReservations() {
    return this.reservationsService.getAllReservations();
  }

  @Get('filter')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async filterReservations(@Query(ValidationPipe) filterDto: FilterReservationsDto) {
    return this.reservationsService.filterReservations(filterDto);
  }

  @Get('my-reservations')
  async getUserReservations(@Request() req) {
    return this.reservationsService.getUserReservations(req.user._id);
  }

  @Get('client/:clientId')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async getClientReservations(@Param('clientId') clientId: string) {
    return this.reservationsService.getClientReservations(clientId);
  }

  @Get(':id')
  async getReservationById(@Param('id') id: string, @Request() req) {
    const reservation = await this.reservationsService.getReservationById(id);

    // Vérifier que l'utilisateur a accès à cette réservation
    if (req.user.role !== 'gérant') {
      const userId = req.user._id.toString();
      let reservationUserId: string;

      if (
        typeof reservation.utilisateur_id === 'object' &&
        reservation.utilisateur_id !== null
      ) {
        reservationUserId = (reservation.utilisateur_id as any)._id?.toString() || '';
      } else {
        reservationUserId = String(reservation.utilisateur_id);
      }

      if (userId !== reservationUserId) {
        throw new UnauthorizedException(
          "Vous n'êtes pas autorisé à voir cette réservation",
        );
      }
    }

    return reservation;
  }

  @Put(':id')
  async updateReservation(
    @Param('id') id: string,
    @Body(ValidationPipe) updateReservationDto: UpdateReservationDto,
    @Request() req,
  ) {
    const reservation = await this.reservationsService.getReservationById(id);

    // Vérifier que l'utilisateur a accès à cette réservation
    if (req.user.role !== 'gérant') {
      const userId = req.user._id.toString();
      let reservationUserId: string;

      if (typeof reservation.utilisateur_id === 'object' && reservation.utilisateur_id !== null) {
          reservationUserId = (reservation.utilisateur_id as any)._id?.toString() || '';
      } else {
        reservationUserId = String(reservation.utilisateur_id);
      }

      if (userId !== reservationUserId) {
        throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette réservation');
      }

      // Les clients ne peuvent pas changer certains champs comme le statut
      delete updateReservationDto.statut;
    }

    return this.reservationsService.updateReservation(id, updateReservationDto);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('gérant')
  async changeReservationStatus(
    @Param('id') id: string,
    @Body('statut', ValidationPipe) statut: string,
  ) {
    return this.reservationsService.changeReservationStatus(id, statut);
  }

  @Delete(':id')
  async deleteReservation(@Param('id') id: string, @Request() req) {
    const reservation = await this.reservationsService.getReservationById(id);

    // Vérifier que l'utilisateur a accès à cette réservation
    if (req.user.role !== 'gérant') {
      const userId = req.user._id.toString();
      let reservationUserId: string;

      if (typeof reservation.utilisateur_id === 'object' && reservation.utilisateur_id !== null) {
          reservationUserId = (reservation.utilisateur_id as any)._id?.toString() || '';
      } else {
        reservationUserId = String(reservation.utilisateur_id);
      }

      if (userId !== reservationUserId) {
        throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer cette réservation');
      }
    }

    return this.reservationsService.deleteReservation(id);
  }

  // Nouveaux endpoints pour le processus de réservation par étapes

  @Post('process/start')
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  async startReservationProcess(
    @Request() req,
    @Body(ValidationPipe) createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.startReservationProcess(req.user._id, createReservationDto);
  }

  @Put('process/step')
  async moveToNextStep(@Request() req, @Body(ValidationPipe) stepDto: ReservationStepDto) {
    return this.reservationsService.moveToNextStep(req.user._id, stepDto);
  }

  @Put('process/options')
  async selectOptions(@Request() req, @Body(ValidationPipe) optionsDto: OptionsSelectionDto) {
    return this.reservationsService.selectOptions(req.user._id, optionsDto);
  }

  @Get('process/summary/:id')
  async getReservationSummary(@Request() req, @Param('id') id: string) {
    return this.reservationsService.getReservationSummary(req.user._id, id);
  }

  @Put('process/promo-code/:id')
  async applyPromoCode(
    @Request() req, 
    @Param('id') id: string, 
    @Body('code_promo', ValidationPipe) codePromo: string
  ) {
    return this.reservationsService.applyPromoCode(req.user._id, id, codePromo);
  }

  @Post('process/payment')
  async processPayment(@Request() req, @Body(ValidationPipe) paymentDto: PaymentDto) {
    return this.paymentService.processPayment(req.user._id, paymentDto);
  }

  getDocumentId(doc: any): string {
    if (!doc) return '';
    if (typeof doc === 'string') return doc;
    if (doc._id) return doc._id.toString();
    return '';
  }
}
