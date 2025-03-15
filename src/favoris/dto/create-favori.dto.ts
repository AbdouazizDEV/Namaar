// src/favoris/dto/create-favori.dto.ts
import { IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateFavoriVoitureDto {
  @IsNotEmpty()
  @IsMongoId()
  voiture_id: string;
}

export class CreateFavoriOffreDto {
  @IsNotEmpty()
  @IsMongoId()
  offre_id: string;
}
