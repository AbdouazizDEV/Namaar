// src/favoris/dto/get-favoris.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFavorisDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  populateDetails?: boolean = false;
}
