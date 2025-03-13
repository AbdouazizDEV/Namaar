// src/clients/dto/update-client-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateClientStatusDto {
  @IsNotEmpty()
  @IsEnum(['actif', 'inactif'])
  statut: string;
}
