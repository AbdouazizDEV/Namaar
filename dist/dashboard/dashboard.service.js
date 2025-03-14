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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment");
const reservation_schema_1 = require("../schemas/reservation.schema");
const location_schema_1 = require("../schemas/location.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const client_schema_1 = require("../schemas/client.schema");
const user_schema_1 = require("../schemas/user.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const alerte_schema_1 = require("../schemas/alerte.schema");
const dashboard_request_dto_1 = require("./dto/dashboard-request.dto");
let DashboardService = class DashboardService {
    constructor(reservationModel, locationModel, voitureModel, clientModel, userModel, factureModel, paiementModel, alerteModel) {
        this.reservationModel = reservationModel;
        this.locationModel = locationModel;
        this.voitureModel = voitureModel;
        this.clientModel = clientModel;
        this.userModel = userModel;
        this.factureModel = factureModel;
        this.paiementModel = paiementModel;
        this.alerteModel = alerteModel;
    }
    async getOverview(requestDto) {
        const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
        const [totalReservations, totalLocations, totalVoitures, voituresDisponibles, clientsActifs,] = await Promise.all([
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
        const [revenuTotal, revenuMensuel, revenuJournalier, montantEnAttente,] = await Promise.all([
            this.getPaiementsTotal(dateDebut, dateFin),
            this.getPaiementsTotal(new Date(new Date().setDate(1)), new Date()),
            this.getPaiementsTotal(new Date(new Date().setHours(0, 0, 0, 0)), new Date()),
            this.getMontantEnAttente(),
        ]);
        const tauxOccupation = await this.calculerTauxOccupation(dateDebut, dateFin);
        const dureeLocationMoyenne = await this.calculerDureeLocationMoyenne(dateDebut, dateFin);
        const [reservationsRecentes, prochainsRetours,] = await Promise.all([
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
    async getStatistiques(requestDto) {
        const periode = requestDto.periode || dashboard_request_dto_1.PeriodeType.MOIS;
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
    async getIndicateursPerformance(requestDto) {
        const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
        const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
        const tauxOccupationParVoiture = await this.calculerTauxOccupationParVoiture(dateDebut, dateFin);
        const revenusParVoiture = await this.calculerRevenusParVoiture(dateDebut, dateFin);
        const revenusParMois = await this.calculerRevenusParMois(dateDebut, dateFin);
        return {
            tauxOccupationParVoiture,
            revenusParVoiture,
            revenusParMois,
        };
    }
    async getAlertes() {
        await this.genererAlertes();
        const alertes = await this.alerteModel.find({ traitee: false }).sort({ date: -1 }).exec();
        const nombreHautePriorite = alertes.filter(alerte => alerte.priorite === 'haute').length;
        return {
            alertes: alertes.map(alerte => ({
                id: alerte._id?.toString() || `temp-${Date.now()}`,
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
    async genererAlertes() {
        const now = new Date();
        const locationsEnRetard = await this.locationModel.find({
            date_fin_reelle: { $lt: now },
            statut: { $ne: 'terminee' }
        }).populate('reservation_id')
            .exec();
        for (const location of locationsEnRetard) {
            if (!location.date_fin_reelle)
                continue;
            const joursRetard = moment().diff(moment(location.date_fin_reelle), 'days');
            let priorite = 'basse';
            if (joursRetard > 3)
                priorite = 'haute';
            else if (joursRetard > 1)
                priorite = 'moyenne';
            const alerteExistante = await this.alerteModel.findOne({
                type: 'retard',
                entiteId: location._id,
                traitee: false
            }).exec();
            if (!alerteExistante) {
                const reservation = await this.reservationModel.findById(location.reservation_id).exec();
                if (!reservation)
                    continue;
                const client = await this.userModel.findById(reservation.utilisateur_id).exec();
                const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
                if (!client || !voiture)
                    continue;
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
        const paiementsEnAttente = await this.paiementModel.find({
            statut: 'en_attente'
        }).exec();
        for (const paiement of paiementsEnAttente) {
            const joursRetard = 1;
            let priorite = 'basse';
            if (joursRetard > 7)
                priorite = 'haute';
            else if (joursRetard > 3)
                priorite = 'moyenne';
            const alerteExistante = await this.alerteModel.findOne({
                type: 'paiement',
                entiteId: paiement._id,
                traitee: false
            }).exec();
            if (!alerteExistante) {
                const reservation = await this.reservationModel.findById(paiement.reservation_id).exec();
                if (!reservation)
                    continue;
                const client = await this.userModel.findById(reservation.utilisateur_id).exec();
                if (!client)
                    continue;
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
        const nbVoituresDisponibles = await this.voitureModel.countDocuments({ disponibilite: true }).exec();
        const totalVoitures = await this.voitureModel.countDocuments().exec();
        const pourcentageDisponible = (nbVoituresDisponibles / totalVoitures) * 100;
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
            }
            else if (pourcentageDisponible < 40) {
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
    async marquerAlerteTraitee(alerteId) {
        await this.alerteModel.findByIdAndUpdate(alerteId, {
            traitee: true,
            dateTraitement: new Date()
        }).exec();
        return this.getAlertes();
    }
    async getRevenusMensuels(requestDto) {
        const annee = requestDto.dateDebut ? new Date(requestDto.dateDebut).getFullYear() : new Date().getFullYear();
        const mois = [];
        const revenus = [];
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
    async getTauxOccupation(requestDto) {
        const periode = requestDto.periode || dashboard_request_dto_1.PeriodeType.MOIS;
        const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : this.getDateDebutParPeriode(periode);
        const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
        const labels = this.genererLabelsParPeriode(periode, dateDebut, dateFin);
        const tauxOccupation = [];
        const totalVoitures = await this.voitureModel.countDocuments().exec();
        for (const label of labels) {
            const debut = this.getDateFromLabel(label, periode);
            const fin = this.getFinPeriode(debut, periode);
            const locationsActives = await this.locationModel.countDocuments({
                $or: [
                    {
                        date_debut_reelle: { $lte: debut },
                        date_fin_reelle: { $gte: debut, $lte: fin }
                    },
                    {
                        date_debut_reelle: { $gte: debut, $lte: fin },
                        date_fin_reelle: { $gte: fin }
                    },
                    {
                        date_debut_reelle: { $lte: debut },
                        date_fin_reelle: { $gte: fin }
                    },
                    {
                        date_debut_reelle: { $gte: debut, $lte: fin },
                        date_fin_reelle: { $gte: debut, $lte: fin }
                    }
                ]
            }).exec();
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
    async getVoituresPerformances(requestDto) {
        const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
        const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
        const voitures = await this.voitureModel.find().exec();
        const performances = [];
        for (const voiture of voitures) {
            const reservations = await this.reservationModel.find({
                voiture_id: voiture._id,
                $or: [
                    { date_debut: { $gte: dateDebut, $lte: dateFin } },
                    { date_fin: { $gte: dateDebut, $lte: dateFin } }
                ]
            }).exec();
            let joursLocation = 0;
            for (const reservation of reservations) {
                const debut = new Date(Math.max(reservation.date_debut.getTime(), dateDebut.getTime()));
                const fin = new Date(Math.min(reservation.date_fin.getTime(), dateFin.getTime()));
                joursLocation += Math.max(0, moment(fin).diff(moment(debut), 'days') + 1);
            }
            const revenuTotal = await this.calculateRevenueForCar(voiture._id, dateDebut, dateFin);
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
        performances.sort((a, b) => b.revenuTotal - a.revenuTotal);
        return {
            performances,
            total: performances.reduce((acc, voiture) => acc + voiture.revenuTotal, 0),
            moyenneTauxOccupation: performances.length > 0
                ? Math.round(performances.reduce((acc, voiture) => acc + voiture.tauxOccupation, 0) / performances.length)
                : 0,
        };
    }
    async getClientsActifs(requestDto) {
        const dateDebut = requestDto.dateDebut ? new Date(requestDto.dateDebut) : new Date(new Date().setMonth(new Date().getMonth() - 6));
        const dateFin = requestDto.dateFin ? new Date(requestDto.dateFin) : new Date();
        const clients = await this.clientModel.find().populate('utilisateur_id').exec();
        const clientsActifs = await this.clientModel.countDocuments({
            date_inscription: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) }
        }).exec();
        const nouveauxClients = await this.clientModel.countDocuments({
            date_inscription: { $gte: dateDebut, $lte: dateFin }
        }).exec();
        const topClients = [];
        for (const client of clients) {
            const user = client.utilisateur_id;
            if (!user)
                continue;
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
    async calculateRevenueForCar(voitureId, dateDebut, dateFin) {
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
            const paiements = await this.paiementModel.find({
                reservation_id: reservation._id,
                statut: 'validé'
            }).exec();
            revenuTotal += paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
        }
        return revenuTotal;
    }
    async getPaiementsTotal(dateDebut, dateFin) {
        const paiements = await this.paiementModel.find({
            date_paiement: { $gte: dateDebut, $lte: dateFin },
            statut: 'validé'
        }).exec();
        return paiements.reduce((total, paiement) => total + paiement.montant, 0);
    }
    async getMontantEnAttente() {
        const paiements = await this.paiementModel.find({
            statut: 'en_attente'
        }).exec();
        return paiements.reduce((total, paiement) => total + paiement.montant, 0);
    }
    async calculerTauxOccupation(dateDebut, dateFin) {
        const totalVoitures = await this.voitureModel.countDocuments().exec();
        const totalJours = moment(dateFin).diff(moment(dateDebut), 'days') + 1;
        const totalJoursVoiturePossibles = totalVoitures * totalJours;
        const reservations = await this.reservationModel.find({
            $or: [
                {
                    date_debut: { $lte: dateDebut },
                    date_fin: { $gte: dateDebut, $lte: dateFin }
                },
                {
                    date_debut: { $gte: dateDebut, $lte: dateFin },
                    date_fin: { $gte: dateFin }
                },
                {
                    date_debut: { $lte: dateDebut },
                    date_fin: { $gte: dateFin }
                },
                {
                    date_debut: { $gte: dateDebut, $lte: dateFin },
                    date_fin: { $gte: dateDebut, $lte: dateFin }
                },
            ]
        }).exec();
        let totalJoursVoitureUtilises = 0;
        for (const reservation of reservations) {
            const debut = reservation.date_debut > dateDebut ? reservation.date_debut : dateDebut;
            const fin = reservation.date_fin < dateFin ? reservation.date_fin : dateFin;
            totalJoursVoitureUtilises += moment(fin).diff(moment(debut), 'days') + 1;
        }
        const tauxOccupation = totalJoursVoiturePossibles > 0 ?
            (totalJoursVoitureUtilises / totalJoursVoiturePossibles) * 100 : 0;
        return Math.round(tauxOccupation);
    }
    async calculerDureeLocationMoyenne(dateDebut, dateFin) {
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
    async getReservationsRecentes() {
        const reservations = await this.reservationModel.find()
            .sort({ date_reservation: -1 })
            .limit(5)
            .exec();
        const result = [];
        for (const reservation of reservations) {
            const client = await this.userModel.findById(reservation.utilisateur_id).exec();
            const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
            if (!client || !voiture)
                continue;
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
    async getProchainsRetours() {
        const now = new Date();
        const dans7Jours = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const locations = await this.locationModel.find({
            date_fin_reelle: { $gte: now, $lte: dans7Jours },
            statut: { $ne: 'terminee' }
        })
            .sort({ date_fin_reelle: 1 })
            .limit(5)
            .exec();
        const result = [];
        for (const location of locations) {
            const reservation = await this.reservationModel.findById(location.reservation_id).exec();
            if (!reservation)
                continue;
            const client = await this.userModel.findById(reservation.utilisateur_id).exec();
            const voiture = await this.voitureModel.findById(reservation.voiture_id).exec();
            if (!client || !voiture)
                continue;
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
    async calculerTauxOccupationParVoiture(dateDebut, dateFin) {
        const voitures = await this.voitureModel.find().exec();
        const totalJoursPeriode = moment(dateFin).diff(moment(dateDebut), 'days') + 1;
        const result = [];
        for (const voiture of voitures) {
            const reservations = await this.reservationModel.find({
                voiture_id: voiture._id,
                $or: [
                    { date_debut: { $gte: dateDebut, $lte: dateFin } },
                    { date_fin: { $gte: dateDebut, $lte: dateFin } },
                    { date_debut: { $lte: dateDebut }, date_fin: { $gte: dateFin } }
                ]
            }).exec();
            let joursLocation = 0;
            for (const reservation of reservations) {
                const debut = reservation.date_debut > dateDebut ? reservation.date_debut : dateDebut;
                const fin = reservation.date_fin < dateFin ? reservation.date_fin : dateFin;
                joursLocation += Math.max(0, moment(fin).diff(moment(debut), 'days') + 1);
            }
            const tauxOccupation = Math.min(100, Math.round((joursLocation / totalJoursPeriode) * 100));
            result.push({
                voitureId: voiture._id.toString(),
                marque: voiture.marque,
                modele: voiture.modele,
                tauxOccupation,
                jours: joursLocation,
            });
        }
        return result.sort((a, b) => b.tauxOccupation - a.tauxOccupation);
    }
    async calculerRevenusParVoiture(dateDebut, dateFin) {
        const voitures = await this.voitureModel.find().exec();
        const result = [];
        for (const voiture of voitures) {
            const revenuTotal = await this.calculateRevenueForCar(voiture._id, dateDebut, dateFin);
            result.push({
                voitureId: voiture._id.toString(),
                marque: voiture.marque,
                modele: voiture.modele,
                revenus: revenuTotal,
            });
        }
        return result.sort((a, b) => b.revenus - a.revenus);
    }
    async calculerRevenusParMois(dateDebut, dateFin) {
        const mois = [];
        const debut = new Date(dateDebut);
        debut.setDate(1);
        while (debut <= dateFin) {
            const finMois = new Date(debut.getFullYear(), debut.getMonth() + 1, 0);
            const finPeriode = finMois <= dateFin ? finMois : dateFin;
            const revenus = await this.getPaiementsTotal(debut, finPeriode);
            mois.push({
                mois: moment(debut).format('MMMM YYYY'),
                revenus,
            });
            debut.setMonth(debut.getMonth() + 1);
        }
        return mois;
    }
    getDateDebutParPeriode(periode) {
        const now = new Date();
        switch (periode) {
            case dashboard_request_dto_1.PeriodeType.JOUR:
                return new Date(now.setDate(now.getDate() - 30));
            case dashboard_request_dto_1.PeriodeType.SEMAINE:
                return new Date(now.setDate(now.getDate() - 12 * 7));
            case dashboard_request_dto_1.PeriodeType.MOIS:
                return new Date(now.setMonth(now.getMonth() - 12));
            case dashboard_request_dto_1.PeriodeType.ANNEE:
                return new Date(now.setFullYear(now.getFullYear() - 5));
            default:
                return new Date(now.setMonth(now.getMonth() - 12));
        }
    }
    genererLabelsParPeriode(periode, dateDebut, dateFin) {
        const labels = [];
        const debut = new Date(dateDebut);
        switch (periode) {
            case dashboard_request_dto_1.PeriodeType.JOUR:
                while (debut <= dateFin) {
                    labels.push(moment(debut).format('DD/MM/YYYY'));
                    debut.setDate(debut.getDate() + 1);
                }
                break;
            case dashboard_request_dto_1.PeriodeType.SEMAINE:
                while (debut <= dateFin) {
                    const fin = new Date(debut);
                    fin.setDate(fin.getDate() + 6);
                    labels.push(`${moment(debut).format('DD/MM')} - ${moment(fin).format('DD/MM')}`);
                    debut.setDate(debut.getDate() + 7);
                }
                break;
            case dashboard_request_dto_1.PeriodeType.MOIS:
                while (debut <= dateFin) {
                    labels.push(moment(debut).format('MMM YYYY'));
                    debut.setMonth(debut.getMonth() + 1);
                }
                break;
            case dashboard_request_dto_1.PeriodeType.ANNEE:
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
    getDateFromLabel(label, periode) {
        switch (periode) {
            case dashboard_request_dto_1.PeriodeType.JOUR:
                return moment(label, 'DD/MM/YYYY').toDate();
            case dashboard_request_dto_1.PeriodeType.SEMAINE:
                const [start] = label.split(' - ');
                return moment(start, 'DD/MM').toDate();
            case dashboard_request_dto_1.PeriodeType.MOIS:
                return moment(label, 'MMM YYYY').toDate();
            case dashboard_request_dto_1.PeriodeType.ANNEE:
                return moment(label, 'YYYY').toDate();
            default:
                return moment(label, 'MMM YYYY').toDate();
        }
    }
    getFinPeriode(debut, periode) {
        const fin = new Date(debut);
        switch (periode) {
            case dashboard_request_dto_1.PeriodeType.JOUR:
                fin.setHours(23, 59, 59);
                break;
            case dashboard_request_dto_1.PeriodeType.SEMAINE:
                fin.setDate(fin.getDate() + 6);
                fin.setHours(23, 59, 59);
                break;
            case dashboard_request_dto_1.PeriodeType.MOIS:
                fin.setMonth(fin.getMonth() + 1);
                fin.setDate(0);
                fin.setHours(23, 59, 59);
                break;
            case dashboard_request_dto_1.PeriodeType.ANNEE:
                fin.setFullYear(fin.getFullYear() + 1);
                fin.setMonth(0, 0);
                fin.setHours(23, 59, 59);
                break;
            default:
                fin.setMonth(fin.getMonth() + 1);
                fin.setDate(0);
                fin.setHours(23, 59, 59);
        }
        return fin;
    }
    async calculerStatistiquesParPeriode(periode, dateDebut, dateFin, labels) {
        const reservations = [];
        const locations = [];
        const revenus = [];
        for (const label of labels) {
            const debut = this.getDateFromLabel(label, periode);
            const fin = this.getFinPeriode(debut, periode);
            const nbReservations = await this.reservationModel.countDocuments({
                date_reservation: { $gte: debut, $lte: fin }
            }).exec();
            const nbLocations = await this.locationModel.countDocuments({
                date_debut_reelle: { $gte: debut, $lte: fin }
            }).exec();
            const revenuPeriode = await this.getPaiementsTotal(debut, fin);
            reservations.push(nbReservations);
            locations.push(nbLocations);
            revenus.push(revenuPeriode);
        }
        return { reservations, locations, revenus };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __param(1, (0, mongoose_1.InjectModel)(location_schema_1.LocationContrat.name)),
    __param(2, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(3, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(5, (0, mongoose_1.InjectModel)(facture_schema_1.Facture.name)),
    __param(6, (0, mongoose_1.InjectModel)(paiement_schema_1.Paiement.name)),
    __param(7, (0, mongoose_1.InjectModel)(alerte_schema_1.Alerte.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map