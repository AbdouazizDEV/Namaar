// src/locations/dto/end-contract.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class EndContractDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  km_retour: number;

  @IsNotEmpty()
  @IsString()
  etat_retour: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frais_supplementaires: number;
}
