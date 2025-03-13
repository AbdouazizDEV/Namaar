"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const client_schema_1 = require("../schemas/client.schema");
let ClientsService = class ClientsService {
    constructor(userModel, clientModel) {
        this.userModel = userModel;
        this.clientModel = clientModel;
    }
    async getAllClients() {
        const users = await this.userModel
            .find({ role: 'client' })
            .select('-mot_de_passe')
            .exec();
        const clientsWithDetails = await Promise.all(users.map(async (user) => {
            const clientDetails = await this.clientModel
                .findOne({ utilisateur_id: user._id })
                .exec();
            return {
                ...user.toObject(),
                telephone: clientDetails?.telephone || null,
                adresse: clientDetails?.adresse || null,
                date_inscription: clientDetails?.date_inscription || null,
            };
        }));
        return clientsWithDetails;
    }
    async getClientById(id) {
        const user = await this.userModel
            .findById(id)
            .select('-mot_de_passe')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        if (user.role !== 'client') {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} n'est pas un client`);
        }
        const clientDetails = await this.clientModel
            .findOne({ utilisateur_id: id })
            .exec();
        if (!clientDetails) {
            throw new common_1.NotFoundException(`Détails du client avec l'ID ${id} non trouvés`);
        }
        return {
            ...user.toObject(),
            telephone: clientDetails.telephone,
            adresse: clientDetails.adresse,
            date_inscription: clientDetails.date_inscription,
        };
    }
    async updateClientStatus(id, updateClientStatusDto) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        if (user.role !== 'client') {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} n'est pas un client`);
        }
        user.statut = updateClientStatusDto.statut;
        await user.save();
        return {
            message: `Le statut du client a été mis à jour avec succès vers '${updateClientStatusDto.statut}'`,
        };
    }
    async getClientStats() {
        const totalClients = await this.userModel
            .countDocuments({ role: 'client' })
            .exec();
        const activeClients = await this.userModel
            .countDocuments({ role: 'client', statut: 'actif' })
            .exec();
        const inactiveClients = await this.userModel
            .countDocuments({ role: 'client', statut: 'inactif' })
            .exec();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newClientsThisMonth = await this.clientModel
            .countDocuments({
            date_inscription: { $gte: startOfMonth },
        })
            .exec();
        return {
            total: totalClients,
            actifs: activeClients,
            inactifs: inactiveClients,
            nouveauxCeMois: newClientsThisMonth,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ClientsService);
//# sourceMappingURL=clients.service.js.map