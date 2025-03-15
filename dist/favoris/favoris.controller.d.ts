import { FavorisService } from './favoris.service';
import { CreateFavoriVoitureDto, CreateFavoriOffreDto } from './dto/create-favori.dto';
import { GetFavorisDto } from './dto/get-favoris.dto';
export declare class FavorisController {
    private readonly favorisService;
    constructor(favorisService: FavorisService);
    getFavorisVoitures(req: any, query: GetFavorisDto): Promise<any[]>;
    addFavoriVoiture(req: any, createFavoriDto: CreateFavoriVoitureDto): Promise<any>;
    removeFavoriVoiture(req: any, voitureId: string): Promise<any>;
    checkVoitureFavori(req: any, voitureId: string): Promise<any>;
    getFavorisOffres(req: any, query: GetFavorisDto): Promise<any[]>;
    addFavoriOffre(req: any, createFavoriDto: CreateFavoriOffreDto): Promise<any>;
    removeFavoriOffre(req: any, offreId: string): Promise<any>;
    checkOffreFavori(req: any, offreId: string): Promise<any>;
    getNotifications(req: any): Promise<any[]>;
    marquerNotificationLue(req: any, notificationId: string): Promise<any>;
    marquerToutesNotificationsLues(req: any): Promise<any>;
    supprimerNotification(req: any, notificationId: string): Promise<any>;
    supprimerToutesNotifications(req: any): Promise<any>;
}
