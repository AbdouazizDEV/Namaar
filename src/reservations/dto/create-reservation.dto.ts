// src/reservations/dto/create-reservation.dto.ts
import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsOptional() // Optionnel pour le gérant qui spécifie l'utilisateur_id manuellement
  @IsString()
  utilisateur_id?: string;

  @IsNotEmpty()
  @IsString()
  voiture_id: string;

  @IsNotEmpty()
  @IsDateString()
  date_debut: Date;

  @IsNotEmpty()
  @IsDateString()
  date_fin: Date;

  @IsOptional()
  @IsString()
  offre_id?: string;

  @IsOptional()
  @IsEnum(['en_attente', 'confirmee', 'annulee', 'terminee'])
  statut?: string = 'en_attente';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix_total?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  code_promo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  etape_reservation?: number = 1;

  @IsOptional()
  @IsBoolean()
  acompte_paye?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montant_acompte?: number = 0;

  @IsOptional()
  @IsString()
  commentaires?: string;
}
