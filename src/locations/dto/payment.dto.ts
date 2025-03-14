// src/locations/dto/payment.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  facture_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  montant: number;

  @IsNotEmpty()
  @IsString()
  methode: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsEnum(['en_attente', 'validé', 'refusé'])
  statut?: string;
}
