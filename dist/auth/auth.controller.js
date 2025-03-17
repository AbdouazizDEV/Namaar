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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("../auth/dto/register.dto");
const login_dto_1 = require("../auth/dto/login.dto");
const public_decorator_1 = require("./public.decorator");
const swagger_1 = require("@nestjs/swagger");
class UserRegistrationResponse {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6072f329a01c7d001bcf7812' }),
    __metadata("design:type", String)
], UserRegistrationResponse.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ngoor' }),
    __metadata("design:type", String)
], UserRegistrationResponse.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FAYE' }),
    __metadata("design:type", String)
], UserRegistrationResponse.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FAYE.Ngoor@example.com' }),
    __metadata("design:type", String)
], UserRegistrationResponse.prototype, "email", void 0);
class AuthTokenResponse {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], AuthTokenResponse.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6072f329a01c7d001bcf7812' }),
    __metadata("design:type", String)
], AuthTokenResponse.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FAYE' }),
    __metadata("design:type", String)
], AuthTokenResponse.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ngoor' }),
    __metadata("design:type", String)
], AuthTokenResponse.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'client' }),
    __metadata("design:type", String)
], AuthTokenResponse.prototype, "role", void 0);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(registerDto) {
        return this.authService.register(registerDto);
    }
    login(loginDto) {
        return this.authService.login(loginDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: "'Inscription d'un nouvel utilisateur'" }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "'L'utilisateur a été créé avec succès.'",
        type: UserRegistrationResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Données invalides ou utilisateur déjà existant.',
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: "'Connexion d'un utilisateur'" }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Connexion réussie.',
        type: AuthTokenResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Identifiants invalides.',
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map