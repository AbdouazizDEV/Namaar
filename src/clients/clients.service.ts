// src/clients/clients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Client, ClientDocument } from '../schemas/client.schema';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async getAllClients() {
    // Récupérer tous les utilisateurs avec le rôle "client"
    const users = await this.userModel
      .find({ role: 'client' })
      .select('-mot_de_passe')
      .exec();

    // Récupérer les informations supplémentaires de client
    const clientsWithDetails = await Promise.all(
      users.map(async (user) => {
        const clientDetails = await this.clientModel
          .findOne({ utilisateur_id: user._id })
          .exec();
        return {
          ...user.toObject(),
          telephone: clientDetails?.telephone || null,
          adresse: clientDetails?.adresse || null,
          date_inscription: clientDetails?.date_inscription || null,
        };
      }),
    );

    return clientsWithDetails;
  }

  async getClientById(id: string) {
    // Récupérer l'utilisateur
    const user = await this.userModel
      .findById(id)
      .select('-mot_de_passe')
      .exec();
    if (!user) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    // Vérifier que c'est bien un client
    if (user.role !== 'client') {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${id} n'est pas un client`,
      );
    }

    // Récupérer les détails du client
    const clientDetails = await this.clientModel
      .findOne({ utilisateur_id: id })
      .exec();
    if (!clientDetails) {
      throw new NotFoundException(
        `Détails du client avec l'ID ${id} non trouvés`,
      );
    }

    // Combiner les informations
    return {
      ...user.toObject(),
      telephone: clientDetails.telephone,
      adresse: clientDetails.adresse,
      date_inscription: clientDetails.date_inscription,
    };
  }

  async updateClientStatus(
    id: string,
    updateClientStatusDto: UpdateClientStatusDto,
  ) {
    // Vérifier que l'utilisateur existe et est un client
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    if (user.role !== 'client') {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${id} n'est pas un client`,
      );
    }

    // Mettre à jour le statut
    user.statut = updateClientStatusDto.statut;
    await user.save();

    return {
      message: `Le statut du client a été mis à jour avec succès vers '${updateClientStatusDto.statut}'`,
    };
  }

  async getClientStats() {
    // Statistiques sur les clients
    const totalClients = await this.userModel
      .countDocuments({ role: 'client' })
      .exec();
    const activeClients = await this.userModel
      .countDocuments({ role: 'client', statut: 'actif' })
      .exec();
    const inactiveClients = await this.userModel
      .countDocuments({ role: 'client', statut: 'inactif' })
      .exec();

    // Clients inscrits ce mois-ci
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
}
