// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { Reservation } from '../schemas/reservation.schema';
import { LocationContrat } from '../schemas/location.schema';
import { Voiture } from '../schemas/voiture.schema';
import { Client } from '../schemas/client.schema';
import { User } from '../schemas/user.schema';
import { Facture } from '../schemas/facture.schema';
import { Paiement } from '../schemas/paiement.schema';
import { Alerte, AlerteDocument } from '../schemas/alerte.schema';
import { DashboardOverviewDto, LocationRecenteDto, ReservationRecenteDto } from './dto/dashboard-overview.dto';
import { StatistiquesPeriodeDto } from './dto/statistiques-periode.dto';
import { IndicateursPerformanceDto, RevenuMensuelDto, VoitureOccupationDto, VoitureRevenuDto } from './dto/indicateurs-performance.dto';
import { AlerteDto, AlertesDto } from './dto/alerte.dto';
import { DashboardRequestDto, PeriodeType } from './dto/dashboard-request.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(LocationContrat.name) private locationModel: Model<LocationContrat>,
    @InjectModel(Voiture.name) private voitureModel: Model<Voiture>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Facture.name) private factureModel: Model<Facture>,
    @InjectModel(Paiement.name) private paiementModel: Model<Paiement>,
    @InjectModel(Alerte.name) private alerteModel: Model<AlerteDocument>,
  ) {}

  /**
   * Obtenir la vue d'ensemble du tableau de bord
   */
  async getOverview(requestDto: DashboardRequestDto): Promise<DashboardOverviewDto> {
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    // Statistiques générales
    const [
      totalReservations,
      totalLocations,
      totalVoitures,
      voituresDisponibles,
      clientsActifs,
    ] = await Promise.all([
      this.reservationModel.countDocuments({
        date_reservation: { $gte: dateDebut, $lte: dateFin }
      }).exec(),
      this.locationModel.countDocuments({
        date_debut_reelle: { $gte: dateDebut, $lte: dateFin }
      }).exec(),
      this.voitureModel.countDocuments().exec(),
      this.voitureModel.countDocuments({ disponibilite: true }).exec(),
      this.clientModel.countDocuments({
        date_inscription: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) }
      }).exec(),
    ]);
    
    // Performance financière
    const [
      revenuTotal,
      revenuMensuel,
      revenuJournalier,
      montantEnAttente,
    ] = await Promise.all([
      this.getPaiementsTotal(dateDebut, dateFin),
      this.getPaiementsTotal(new Date(new Date().setDate(1)), new Date()),
      this.getPaiementsTotal(new Date(new Date().setHours(0, 0, 0, 0)), new Date()),
      this.getMontantEnAttente(),
    ]);
    
    // Taux d'occupation
    const tauxOccupation = await this.calculerTauxOccupation(dateDebut, dateFin);
    const dureeLocationMoyenne = await this.calculerDureeLocationMoyenne(dateDebut, dateFin);
    
    // Activité récente
    const [
      reservationsRecentes,
      prochainsRetours,
    ] = await Promise.all([
      this.getReservationsRecentes(),
      this.getProchainsRetours(),
    ]);
    
    return {
      totalReservations,
      totalLocations,
      totalVoitures,
      voituresDisponibles,
      clientsActifs,
      revenuTotal,
      revenuMensuel,
      revenuJournalier,
      montantEnAttente,
      tauxOccupation,
      dureeLocationMoyenne,
      reservationsRecentes,
      prochainsRetours,
    };
  }

  /**
   * Obtenir les statistiques par période
   */
  async getStatistiques(requestDto: DashboardRequestDto): Promise<StatistiquesPeriodeDto> {
    const periode = requestDto.periode || PeriodeType.MOIS;
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : this.getDateDebutParPeriode(periode);
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    const labels = this.genererLabelsParPeriode(periode, dateDebut, dateFin);
    const statistiques = await this.calculerStatistiquesParPeriode(periode, dateDebut, dateFin, labels);
    
    return {
      periode,
      labels,
      reservations: statistiques.reservations,
      locations: statistiques.locations,
      revenus: statistiques.revenus,
    };
  }

  /**
   * Obtenir les indicateurs de performance
   */
  async getIndicateursPerformance(requestDto: DashboardRequestDto): Promise<IndicateursPerformanceDto> {
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    // Taux d'occupation par voiture
    const tauxOccupationParVoiture = await this.calculerTauxOccupationParVoiture(dateDebut, dateFin);
    
    // Revenus par voiture
    const revenusParVoiture = await this.calculerRevenusParVoiture(dateDebut, dateFin);
    
    // Revenus par mois
    const revenusParMois = await this.calculerRevenusParMois(dateDebut, dateFin);
    
    return {
      tauxOccupationParVoiture,
      revenusParVoiture,
      revenusParMois,
    };
  }

  /**
   * Obtenir les alertes actives
   */
  async getAlertes(): Promise<AlertesDto> {
    // D'abord, vérifier s'il y a des alertes à générer
    await this.genererAlertes();

    // Ensuite, récupérer toutes les alertes actives (non traitées)
    const alertes = await this.alerteModel.find({ traitee: false }).sort({ date: -1 }).exec();

    // Compter le nombre d'alertes de haute priorité
    const nombreHautePriorite = alertes.filter(alerte => alerte.priorite === 'haute').length;

    return {
      alertes: alertes.map(alerte => ({
        id: alerte._id?.toString() || `temp-${Date.now()}`, // Garantir qu'un ID est toujours présent
        type: alerte.type,
        message: alerte.message,
        priorite: alerte.priorite,
        date: alerte.date,
        entiteId: alerte.entiteId?.toString(),
        entiteType: alerte.entiteType,
        action: alerte.action,
        traitee: alerte.traitee,
        dateTraitement: alerte.dateTraitement,
      })),
      nombreTotal: alertes.length,
      nombreHautePriorite,
    };
  }
  /**
   * Générer les alertes en fonction des données actuelles
   */
  private async genererAlertes(): Promise<void> {
    // 1. Alertes de retard de retour
    const now = new Date();
    const locationsEnRetard = await this.locationModel.find({
      date_fin_reelle: { $lt: now },
      statut: { $ne: 'terminee' }
    }).populate('reservation_id')
      .exec();
    
    for (const location of locationsEnRetard) {
      if (!location.date_fin_reelle) continue;
      
      const joursRetard = moment().diff(moment(location.date_fin_reelle), 'days');
      let priorite = 'basse';
      if (joursRetard > 3) priorite = 'haute';
      else if (joursRetard > 1) priorite = 'moyenne';
      
      // Vérifier si une alerte similaire existe déjà
      const alerteExistante = await this.alerteModel.findOne({
        type: 'retard',
        entiteId: location._id,
        traitee: false
      }).exec();
      
      if (!alerteExistante) {
        // Obtenir les détails de la réservation, du client et de la voiture
        const reservation = await this.reservationModel.findById(location.reservation_id).exec();
        if (!reservation) continue;
        
        const client = await this.userModel.findById(reservation.utilisateur_id).exec();
        const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
        
        if (!client || !voiture) continue;
        
        await this.alerteModel.create({
          type: 'retard',
          message: `Retard de ${joursRetard} jour(s) pour la location de ${voiture.marque} ${voiture.modele}`,
          priorite,
          date: new Date(),
          entiteId: location._id,
          entiteType: 'location',
          action: 'Contacter le client',
          traitee: false
        });
      }
    }
    
    // 2. Alertes de maintenance - Nous n'avons pas ces champs dans le schéma de voiture, donc on saute cette partie
    /* Désactivé car ces champs ne sont pas présents dans le schéma Voiture
    const voituresMaintenanceRequise = await this.voitureModel.find({
      $or: [
        { prochain_entretien_km: { $lte: 500 } }, // Moins de 500 km avant prochain entretien
        { prochaine_vidange: { $lte: new Date(new Date().setDate(new Date().getDate() + 15)) } } // Moins de 15 jours avant vidange
      ]
    }).exec();
    
    for (const voiture of voituresMaintenanceRequise) {
      // Code désactivé
    }
    */
    
    // 3. Alertes de paiements en attente
    const paiementsEnAttente = await this.paiementModel.find({
      statut: 'en_attente'
    }).exec();
    
    for (const paiement of paiementsEnAttente) {
      const joursRetard = 1; // Par défaut, car nous n'avons pas de date_echeance dans le schéma
      let priorite = 'basse';
      if (joursRetard > 7) priorite = 'haute';
      else if (joursRetard > 3) priorite = 'moyenne';
      
      // Vérifier si une alerte similaire existe déjà
      const alerteExistante = await this.alerteModel.findOne({
        type: 'paiement',
        entiteId: paiement._id,
        traitee: false
      }).exec();
      
      if (!alerteExistante) {
        // Obtenir les détails de la réservation et du client
        const reservation = await this.reservationModel.findById(paiement.reservation_id).exec();
        if (!reservation) continue;
        
        const client = await this.userModel.findById(reservation.utilisateur_id).exec();
        if (!client) continue;
        
        await this.alerteModel.create({
          type: 'paiement',
          message: `Paiement en attente pour la réservation #${reservation._id} (${paiement.montant} FCFA)`,
          priorite,
          date: new Date(),
          entiteId: paiement._id,
          entiteType: 'paiement',
          action: 'Vérifier le paiement',
          traitee: false
        });
      }
    }
    
    // 4. Alertes de disponibilité faible
    const nbVoituresDisponibles = await this.voitureModel.countDocuments({ disponibilite: true }).exec();
    const totalVoitures = await this.voitureModel.countDocuments().exec();
    const pourcentageDisponible = (nbVoituresDisponibles / totalVoitures) * 100;
    
    // Vérifier si une alerte de disponibilité existe déjà
    const alerteDispoExistante = await this.alerteModel.findOne({
      type: 'disponibilité',
      traitee: false
    }).exec();
    
    if (!alerteDispoExistante) {
      if (pourcentageDisponible < 20) {
        await this.alerteModel.create({
          type: 'disponibilité',
          message: `Disponibilité des véhicules critique : seulement ${nbVoituresDisponibles} sur ${totalVoitures} disponibles (${Math.round(pourcentageDisponible)}%)`,
          priorite: 'haute',
          date: new Date(),
          action: 'Vérifier les retours prévus',
          traitee: false
        });
      } else if (pourcentageDisponible < 40) {
        await this.alerteModel.create({
          type: 'disponibilité',
          message: `Disponibilité des véhicules faible : ${nbVoituresDisponibles} sur ${totalVoitures} disponibles (${Math.round(pourcentageDisponible)}%)`,
          priorite: 'moyenne',
          date: new Date(),
          action: 'Surveiller les réservations',
          traitee: false
        });
      }
    }
  }

  /**
   * Marquer une alerte comme traitée
   */
  async marquerAlerteTraitee(alerteId: string): Promise<AlertesDto> {
    await this.alerteModel.findByIdAndUpdate(alerteId, {
      traitee: true,
      dateTraitement: new Date()
    }).exec();
    
    return this.getAlertes();
  }

  /**
   * Obtenir les revenus mensuels
   */
  async getRevenusMensuels(requestDto: DashboardRequestDto): Promise<any> {
    const annee = requestDto.dateDebut ? new Date(requestDto.dateDebut).getFullYear() : new Date().getFullYear();
    
    const mois: string[] = [];
    const revenus: number[] = [];
    
    for (let i = 0; i < 12; i++) {
      const debutMois = new Date(annee, i, 1);
      const finMois = new Date(annee, i + 1, 0);
      
      const revenuMois = await this.getPaiementsTotal(debutMois, finMois);
      
      mois.push(moment(debutMois).format('MMMM'));
      revenus.push(revenuMois);
    }
    
    return {
      labels: mois,
      data: revenus,
      total: revenus.reduce((acc, val) => acc + val, 0),
    };
  }

  /**
   * Obtenir le taux d'occupation de la flotte
   */
  async getTauxOccupation(requestDto: DashboardRequestDto): Promise<any> {
    const periode = requestDto.periode || PeriodeType.MOIS;
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : this.getDateDebutParPeriode(periode);
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    const labels = this.genererLabelsParPeriode(periode, dateDebut, dateFin);
    const tauxOccupation: number[] = [];
    
    // Nombre total de voitures
    const totalVoitures = await this.voitureModel.countDocuments().exec();
    
    for (const label of labels) {
      const debut = this.getDateFromLabel(label, periode);
      const fin = this.getFinPeriode(debut, periode);
      
      // Compter les locations actives pendant cette période
      const locationsActives = await this.locationModel.countDocuments({
        $or: [
          // Cas 1: La location commence avant la période et se termine pendant la période
          {
            date_debut_reelle: { $lte: debut },
            date_fin_reelle: { $gte: debut, $lte: fin }
          },
          // Cas 2: La location commence pendant la période et se termine après la période
          {
            date_debut_reelle: { $gte: debut, $lte: fin },
            date_fin_reelle: { $gte: fin }
          },
          // Cas 3: La location commence avant la période et se termine après la période
          {
            date_debut_reelle: { $lte: debut },
            date_fin_reelle: { $gte: fin }
          },
          // Cas 4: La location commence et se termine pendant la période
          {
            date_debut_reelle: { $gte: debut, $lte: fin },
            date_fin_reelle: { $gte: debut, $lte: fin }
          }
        ]
      }).exec();
      
      // Calcul du taux d'occupation
      const taux = totalVoitures ? (locationsActives / totalVoitures) * 100 : 0;
      tauxOccupation.push(Math.round(taux));
    }
    
    return {
      labels,
      data: tauxOccupation,
      moyenne: tauxOccupation.length > 0 
        ? Math.round(tauxOccupation.reduce((acc, val) => acc + val, 0) / tauxOccupation.length) 
        : 0,
    };
  }

  /**
   * Obtenir les performances par voiture
   */
  async getVoituresPerformances(requestDto: DashboardRequestDto): Promise<any> {
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    // Obtenir toutes les voitures
    const voitures = await this.voitureModel.find().exec();
    
    const performances: Array<{
      id: string;
      marque: string;
      modele: string;
      annee: number;
      joursLocation: number;
      revenuTotal: number;
      tauxOccupation: number;
      revenuParJour: number;
    }> = [];
    
    for (const voiture of voitures) {
      // Obtenir toutes les réservations pour cette voiture
      const reservations = await this.reservationModel.find({
        voiture_id: voiture._id,
        $or: [
          { date_debut: { $gte: dateDebut, $lte: dateFin } },
          { date_fin: { $gte: dateDebut, $lte: dateFin } }
        ]
      }).exec();
      
      // Calculer le nombre de jours de location
      let joursLocation = 0;
      for (const reservation of reservations) {
        const debut = new Date(Math.max(reservation.date_debut.getTime(), dateDebut.getTime()));
        const fin = new Date(Math.min(reservation.date_fin.getTime(), dateFin.getTime()));
        joursLocation += Math.max(0, moment(fin).diff(moment(debut), 'days') + 1);
      }
      
      // Calculer le revenu total pour cette voiture
      const revenuTotal = await this.calculateRevenueForCar(voiture._id, dateDebut, dateFin);
      
      // Calculer le taux d'occupation
      const totalJoursPeriode = moment(dateFin).diff(moment(dateDebut), 'days') + 1;
      const tauxOccupation = Math.round((joursLocation / totalJoursPeriode) * 100);
      
      performances.push({
        id: voiture._id.toString(),
        marque: voiture.marque,
        modele: voiture.modele,
        annee: voiture.annee,
        joursLocation,
        revenuTotal,
        tauxOccupation,
        revenuParJour: joursLocation > 0 ? Math.round(revenuTotal / joursLocation) : 0,
      });
    }
    
    // Trier par revenu total (du plus élevé au plus bas)
    performances.sort((a, b) => b.revenuTotal - a.revenuTotal);
    
    return {
      performances,
      total: performances.reduce((acc, voiture) => acc + voiture.revenuTotal, 0),
      moyenneTauxOccupation: performances.length > 0 
        ? Math.round(performances.reduce((acc, voiture) => acc + voiture.tauxOccupation, 0) / performances.length) 
        : 0,
    };
  }
  
  /**
   * Obtenir les statistiques des clients actifs
   */
  async getClientsActifs(requestDto: DashboardRequestDto): Promise<any> {
    const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
    
    // Obtenir tous les clients
    const clients = await this.clientModel.find().populate('utilisateur_id').exec();
    
    // Statistiques globales
    const clientsActifs = await this.clientModel.countDocuments({
      date_inscription: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) }
    }).exec();
    
    const nouveauxClients = await this.clientModel.countDocuments({
      date_inscription: { $gte: dateDebut, $lte: dateFin }
    }).exec();
    
    // Obtenir le top 10 des clients par revenus générés
    const topClients: Array<{
      id: string;
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      revenuGenere: number;
      nbLocations: number;
      moyenneParLocation: number;
      dernierLogin: Date;
    }> = [];
    
    for (const client of clients) {
      const user = client.utilisateur_id as any;
      if (!user) continue;
      
      // Calculer le revenu total généré par ce client
      const reservations = await this.reservationModel.find({
        utilisateur_id: user._id,
        date_reservation: { $gte: dateDebut, $lte: dateFin },
        statut: { $ne: 'annulee' }
      }).exec();
      
      let revenuTotal = 0;
      for (const reservation of reservations) {
        const paiements = await this.paiementModel.find({
          reservation_id: reservation._id,
          statut: 'validé'
        }).exec();
        
        revenuTotal += paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
      }
      
      // Calculer le nombre de locations
      const nbLocations = await this.locationModel.countDocuments({
        reservation_id: { $in: reservations.map(r => r._id) }
      }).exec();
      
      if (nbLocations > 0) {
        topClients.push({
          id: client._id.toString(),
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: client.telephone || '',
          revenuGenere: revenuTotal,
          nbLocations,
          moyenneParLocation: nbLocations > 0 ? Math.round(revenuTotal / nbLocations) : 0,
          dernierLogin: user.derniere_connexion || client.date_inscription,
        });
      }
    }
    
    // Trier par revenu généré (du plus élevé au plus bas) et limiter à 10
    topClients.sort((a, b) => b.revenuGenere - a.revenuGenere);
    const top10Clients = topClients.slice(0, 10);
    
    return {
      total: clients.length,
      actifs: clientsActifs,
      nouveaux: nouveauxClients,
      tauxActivite: clients.length > 0 ? Math.round((clientsActifs / clients.length) * 100) : 0,
      topClients: top10Clients,
    };
  }
  
  /**
   * Calculer le revenu généré par une voiture spécifique
   */
  private async calculateRevenueForCar(voitureId: Types.ObjectId, dateDebut: Date, dateFin: Date): Promise<number> {
    // Obtenir toutes les réservations pour cette voiture dans la période
    const reservations = await this.reservationModel.find({
      voiture_id: voitureId,
      $or: [
        { date_debut: { $gte: dateDebut, $lte: dateFin } },
        { date_fin: { $gte: dateDebut, $lte: dateFin } },
        { date_debut: { $lte: dateDebut }, date_fin: { $gte: dateFin } }
      ]
    }).exec();
    
    let revenuTotal = 0;
    
    for (const reservation of reservations) {
      // Récupérer les paiements associés à cette réservation
      const paiements = await this.paiementModel.find({
        reservation_id: reservation._id,
        statut: 'validé'
      }).exec();
      
      // Ajouter au total
      revenuTotal += paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    }
    
    return revenuTotal;
  }
  
  /**
   * Obtenir le total des paiements pour une période donnée
   */
  private async getPaiementsTotal(dateDebut: Date, dateFin: Date): Promise<number> {
    const paiements = await this.paiementModel.find({
      date_paiement: { $gte: dateDebut, $lte: dateFin },
      statut: 'validé'
    }).exec();
    
    return paiements.reduce((total, paiement) => total + paiement.montant, 0);
  }
  
  /**
   * Obtenir le montant total des paiements en attente
   */
  private async getMontantEnAttente(): Promise<number> {
    const paiements = await this.paiementModel.find({
      statut: 'en_attente'
    }).exec();
    
    return paiements.reduce((total, paiement) => total + paiement.montant, 0);
  }
  
  /**
   * Calculer le taux d'occupation global pour une période donnée
   */
  private async calculerTauxOccupation(dateDebut: Date, dateFin: Date): Promise<number> {
    // Nombre total de voitures
    const totalVoitures = await this.voitureModel.countDocuments().exec();
    
    // Nombre total de jours dans la période
    const totalJours = moment(dateFin).diff(moment(dateDebut), 'days') + 1;
    
    // Nombre total de jours-voiture possibles (nombre de voitures * nombre de jours)
    const totalJoursVoiturePossibles = totalVoitures * totalJours;
    
    // Obtenir toutes les réservations dans la période
    const reservations = await this.reservationModel.find({
      $or: [
        // Cas 1: La réservation commence avant la période et se termine pendant la période
        {
          date_debut: { $lte: dateDebut },
          date_fin: { $gte: dateDebut, $lte: dateFin }
        },
        // Cas 2: La réservation commence pendant la période et se termine après la période
        {
          date_debut: { $gte: dateDebut, $lte: dateFin },
          date_fin: { $gte: dateFin }
        },
        // Cas 3: La réservation commence avant la période et se termine après la période
        {
          date_debut: { $lte: dateDebut },
          date_fin: { $gte: dateFin }
        },
        // Cas 4: La réservation commence et se termine pendant la période
        {
          date_debut: { $gte: dateDebut, $lte: dateFin },
          date_fin: { $gte: dateDebut, $lte: dateFin }
        },
      ]
    }).exec();
    
    // Calculer le nombre total de jours-voiture utilisés
    let totalJoursVoitureUtilises = 0;
    for (const reservation of reservations) {
      const debut = reservation.date_debut > dateDebut ? reservation.date_debut : dateDebut;
      const fin = reservation.date_fin < dateFin ? reservation.date_fin : dateFin;
      totalJoursVoitureUtilises += moment(fin).diff(moment(debut), 'days') + 1;
    }
    
    // Calculer le taux d'occupation
    const tauxOccupation = totalJoursVoiturePossibles > 0 ? 
      (totalJoursVoitureUtilises / totalJoursVoiturePossibles) * 100 : 0;
      return Math.round(tauxOccupation);
  }
  
  /**
   * Calculer la durée moyenne des locations
   */
  private async calculerDureeLocationMoyenne(dateDebut: Date, dateFin: Date): Promise<number> {
    const reservations = await this.reservationModel.find({
      date_reservation: { $gte: dateDebut, $lte: dateFin },
      statut: 'terminee'
    }).exec();
    
    if (reservations.length === 0) {
      return 0;
    }
    
    const dureeTotal = reservations.reduce((sum, reservation) => {
      const duree = moment(reservation.date_fin).diff(moment(reservation.date_debut), 'days') + 1;
      return sum + duree;
    }, 0);
    
    return Math.round(dureeTotal / reservations.length);
  }
  
  /**
   * Obtenir les réservations récentes
   */
  private async getReservationsRecentes(): Promise<ReservationRecenteDto[]> {
    const reservations = await this.reservationModel.find()
      .sort({ date_reservation: -1 })
      .limit(5)
      .exec();
    
    const result: ReservationRecenteDto[] = [];
    
    for (const reservation of reservations) {
      const client = await this.userModel.findById(reservation.utilisateur_id).exec();
      const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
      
      if (!client || !voiture) continue;
      
      result.push({
        id: reservation._id.toString(),
        clientNom: client['nom'] || '',
        clientPrenom: client['prenom'] || '',
        voitureMarque: voiture.marque,
        voitureModele: voiture.modele,
        dateDebut: reservation.date_debut,
        dateFin: reservation.date_fin,
        statut: reservation.statut,
        montantTotal: reservation.prix_total,
      });
    }
    
    return result;
  }
  
  /**
   * Obtenir les prochains retours de location
   */
  private async getProchainsRetours(): Promise<LocationRecenteDto[]> {
    const now = new Date();
    const dans7Jours = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const locations = await this.locationModel.find({
      date_fin_reelle: { $gte: now, $lte: dans7Jours },
      statut: { $ne: 'terminee' }
    })
      .sort({ date_fin_reelle: 1 })
      .limit(5)
      .exec();
    
    const result: LocationRecenteDto[] = [];
    
    for (const location of locations) {
      const reservation = await this.reservationModel.findById(location.reservation_id).exec();
      if (!reservation) continue;
      
      const client = await this.userModel.findById(reservation.utilisateur_id).exec();
      const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
      
      if (!client || !voiture) continue;
      
      const jours = moment(location.date_fin_reelle).diff(moment(location.date_debut_reelle), 'days') + 1;
      
      result.push({
        id: location._id.toString(),
        clientNom: client['nom'] || '',
        clientPrenom: client['prenom'] || '',
        voitureMarque: voiture.marque,
        voitureModele: voiture.modele,
        dateDebut: location.date_debut_reelle,
        dateFin: location.date_fin_reelle,
        jours,
        kmDepart: location.km_depart,
        montantTotal: reservation.prix_total,
      });
    }
    
    return result;
  }
  
  /**
   * Calculer les taux d'occupation par voiture
   */
  private async calculerTauxOccupationParVoiture(dateDebut: Date, dateFin: Date): Promise<VoitureOccupationDto[]> {
    const voitures = await this.voitureModel.find().exec();
    const totalJoursPeriode = moment(dateFin).diff(moment(dateDebut), 'days') + 1;
    
    const result: VoitureOccupationDto[] = [];
    
    for (const voiture of voitures) {
      // Obtenir toutes les réservations pour cette voiture
      const reservations = await this.reservationModel.find({
        voiture_id: voiture._id,
        $or: [
          { date_debut: { $gte: dateDebut, $lte: dateFin } },
          { date_fin: { $gte: dateDebut, $lte: dateFin } },
          { date_debut: { $lte: dateDebut }, date_fin: { $gte: dateFin } }
        ]
      }).exec();
      
      // Calculer le nombre de jours de réservation
      let joursLocation = 0;
      for (const reservation of reservations) {
        const debut = reservation.date_debut > dateDebut ? reservation.date_debut : dateDebut;
        const fin = reservation.date_fin < dateFin ? reservation.date_fin : dateFin;
        joursLocation += Math.max(0, moment(fin).diff(moment(debut), 'days') + 1);
      }
      
      // Calculer le taux d'occupation
      const tauxOccupation = Math.min(100, Math.round((joursLocation / totalJoursPeriode) * 100));
      
      result.push({
        voitureId: voiture._id.toString(),
        marque: voiture.marque,
        modele: voiture.modele,
        tauxOccupation,
        jours: joursLocation,
      });
    }
    
    // Trier par taux d'occupation (du plus élevé au plus bas)
    return result.sort((a, b) => b.tauxOccupation - a.tauxOccupation);
  }
  
  /**
   * Calculer les revenus par voiture
   */
  private async calculerRevenusParVoiture(dateDebut: Date, dateFin: Date): Promise<VoitureRevenuDto[]> {
    const voitures = await this.voitureModel.find().exec();
    const result: VoitureRevenuDto[] = [];
    
    for (const voiture of voitures) {
      const revenuTotal = await this.calculateRevenueForCar(voiture._id, dateDebut, dateFin);
      
      result.push({
        voitureId: voiture._id.toString(),
        marque: voiture.marque,
        modele: voiture.modele,
        revenus: revenuTotal,
      });
    }
    
    // Trier par revenus (du plus élevé au plus bas)
    return result.sort((a, b) => b.revenus - a.revenus);
  }
  
  /**
   * Calculer les revenus par mois
   */
  private async calculerRevenusParMois(dateDebut: Date, dateFin: Date): Promise<RevenuMensuelDto[]> {
    const mois: RevenuMensuelDto[] = [];
    const debut = new Date(dateDebut);
    
    // S'assurer que nous commençons par le premier jour du mois
    debut.setDate(1);
    
    // Calculer les revenus pour chaque mois dans la période
    while (debut <= dateFin) {
      const finMois = new Date(debut.getFullYear(), debut.getMonth() + 1, 0);
      const finPeriode = finMois <= dateFin ? finMois : dateFin;
      
      const revenus = await this.getPaiementsTotal(debut, finPeriode);
      
      mois.push({
        mois: moment(debut).format('MMMM YYYY'),
        revenus,
      });
      
      // Passer au mois suivant
      debut.setMonth(debut.getMonth() + 1);
    }
    
    return mois;
  }
  
  /**
   * Obtenir la date de début en fonction de la période
   */
  private getDateDebutParPeriode(periode: PeriodeType): Date {
    const now = new Date();
    
    switch (periode) {
      case PeriodeType.JOUR:
        return new Date(now.setDate(now.getDate() - 30)); // 30 derniers jours
      case PeriodeType.SEMAINE:
        return new Date(now.setDate(now.getDate() - 12 * 7)); // 12 dernières semaines
      case PeriodeType.MOIS:
        return new Date(now.setMonth(now.getMonth() - 12)); // 12 derniers mois
      case PeriodeType.ANNEE:
        return new Date(now.setFullYear(now.getFullYear() - 5)); // 5 dernières années
      default:
        return new Date(now.setMonth(now.getMonth() - 12)); // Par défaut: 12 derniers mois
    }
  }
  
  /**
   * Générer les labels pour une période donnée
   */
  private genererLabelsParPeriode(periode: PeriodeType, dateDebut: Date, dateFin: Date): string[] {
    const labels: string[] = [];
    const debut = new Date(dateDebut);
    
    switch (periode) {
      case PeriodeType.JOUR:
        while (debut <= dateFin) {
          labels.push(moment(debut).format('DD/MM/YYYY'));
          debut.setDate(debut.getDate() + 1);
        }
        break;
      
      case PeriodeType.SEMAINE:
        while (debut <= dateFin) {
          const fin = new Date(debut);
          fin.setDate(fin.getDate() + 6);
          
          labels.push(`${moment(debut).format('DD/MM')} - ${moment(fin).format('DD/MM')}`);
          debut.setDate(debut.getDate() + 7);
        }
        break;
      
      case PeriodeType.MOIS:
        while (debut <= dateFin) {
          labels.push(moment(debut).format('MMM YYYY'));
          debut.setMonth(debut.getMonth() + 1);
        }
        break;
      
      case PeriodeType.ANNEE:
        while (debut <= dateFin) {
          labels.push(moment(debut).format('YYYY'));
          debut.setFullYear(debut.getFullYear() + 1);
        }
        break;
      
      default:
        while (debut <= dateFin) {
          labels.push(moment(debut).format('MMM YYYY'));
          debut.setMonth(debut.getMonth() + 1);
        }
    }
    
    return labels;
  }
  
  /**
   * Obtenir une date à partir d'un label de période
   */
  private getDateFromLabel(label: string, periode: PeriodeType): Date {
    switch (periode) {
      case PeriodeType.JOUR:
        return moment(label, 'DD/MM/YYYY').toDate();
      
      case PeriodeType.SEMAINE:
        const [start] = label.split(' - ');
        return moment(start, 'DD/MM').toDate();
      
      case PeriodeType.MOIS:
        return moment(label, 'MMM YYYY').toDate();
      
      case PeriodeType.ANNEE:
        return moment(label, 'YYYY').toDate();
      
      default:
        return moment(label, 'MMM YYYY').toDate();
    }
  }
  
  /**
   * Obtenir la fin d'une période à partir de sa date de début
   */
  private getFinPeriode(debut: Date, periode: PeriodeType): Date {
    const fin = new Date(debut);
    
    switch (periode) {
      case PeriodeType.JOUR:
        fin.setHours(23, 59, 59);
        break;
      
      case PeriodeType.SEMAINE:
        fin.setDate(fin.getDate() + 6);
        fin.setHours(23, 59, 59);
        break;
      
      case PeriodeType.MOIS:
        fin.setMonth(fin.getMonth() + 1);
        fin.setDate(0); // Dernier jour du mois
        fin.setHours(23, 59, 59);
        break;
      
      case PeriodeType.ANNEE:
        fin.setFullYear(fin.getFullYear() + 1);
        fin.setMonth(0, 0); // 31 décembre
        fin.setHours(23, 59, 59);
        break;
      
      default:
        fin.setMonth(fin.getMonth() + 1);
        fin.setDate(0);
        fin.setHours(23, 59, 59);
    }
    
    return fin;
  }
  
  /**
   * Calculer les statistiques par période
   */
  private async calculerStatistiquesParPeriode(
    periode: PeriodeType,
    dateDebut: Date,
    dateFin: Date,
    labels: string[]
  ): Promise<{ reservations: number[]; locations: number[]; revenus: number[] }> {
    const reservations: number[] = [];
    const locations: number[] = [];
    const revenus: number[] = [];
    
    for (const label of labels) {
      const debut = this.getDateFromLabel(label, periode);
      const fin = this.getFinPeriode(debut, periode);
      
      // Nombre de réservations pour cette période
      const nbReservations = await this.reservationModel.countDocuments({
        date_reservation: { $gte: debut, $lte: fin }
      }).exec();
      
      // Nombre de locations pour cette période
      const nbLocations = await this.locationModel.countDocuments({
        date_debut_reelle: { $gte: debut, $lte: fin }
      }).exec();
      
      // Revenus pour cette période
      const revenuPeriode = await this.getPaiementsTotal(debut, fin);
      
      reservations.push(nbReservations);
      locations.push(nbLocations);
      revenus.push(revenuPeriode);
    }
    
    return { reservations, locations, revenus };
  }
}
