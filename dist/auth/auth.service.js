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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../schemas/user.schema");
const client_schema_1 = require("../schemas/client.schema");
let AuthService = class AuthService {
    constructor(userModel, clientModel, jwtService) {
        this.userModel = userModel;
        this.clientModel = clientModel;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, mot_de_passe, nom, prenom, telephone, adresse } = registerDto;
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const newUser = new this.userModel({
            email,
            mot_de_passe: hashedPassword,
            nom,
            prenom,
            role: 'client',
            statut: 'actif',
        });
        const savedUser = await newUser.save();
        const newClient = new this.clientModel({
            utilisateur_id: savedUser._id,
            telephone,
            adresse,
            date_inscription: new Date(),
        });
        await newClient.save();
        return { message: 'Utilisateur enregistré avec succès' };
    }
    async login(loginDto) {
        const { email, mot_de_passe } = loginDto;
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const payload = { email: user.email, sub: user._id, role: user.role };
        const token = this.jwtService.sign(payload);
        const userResponse = {
            _id: user._id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            statut: user.statut,
        };
        return { token, user: userResponse };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map