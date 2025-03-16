// src/reservations/dto/reservation-step.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationStepDto {
  @IsNotEmpty()
  @IsString()
  reservation_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  etape: number;
}

export class OptionsSelectionDto {
  @IsNotEmpty()
  @IsString()
  reservation_id: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  options_ids: string[];
}

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  reservation_id: string;

  @IsNotEmpty()
  @IsString()
  methode_paiement: string;

  @IsNotEmpty()
  @IsBoolean()
  payer_acompte: boolean;

  @IsOptional()
  @IsString()
  token_paiement?: string;
}
