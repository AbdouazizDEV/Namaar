// src/clients/dto/update-client-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientStatusDto {
  @ApiProperty({
    description: 'Statut du client',
    example: 'actif',
    enum: ['actif', 'inactif'],
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(['actif', 'inactif'])
  statut: string;
}
