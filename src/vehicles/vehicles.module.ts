// src/vehicles/vehicles.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Voiture, VoitureSchema } from '../schemas/voiture.schema';
import { Image, ImageSchema } from '../schemas/image.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { FavorisModule } from '../favoris/favoris.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Voiture.name, schema: VoitureSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
    CloudinaryModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    forwardRef(() => FavorisModule), // Importer FavorisModule avec forwardRef
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
