// src/locations/dto/start-contract.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StartContractDto {
  @IsNotEmpty()
  @IsString()
  reservation_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  km_depart: number;

  @IsNotEmpty()
  @IsString()
  etat_depart: string;
}
