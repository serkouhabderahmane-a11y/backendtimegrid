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
exports.SharingController = void 0;
const common_1 = require("@nestjs/common");
const sharing_service_1 = require("./sharing.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SharingController = class SharingController {
    sharingService;
    constructor(sharingService) {
        this.sharingService = sharingService;
    }
    async createShareLink(req, body) {
        return this.sharingService.createShareLink(req.user.tenantId, req.user.id, body.entityType, body.entityId, body.expiresInHours || 24);
    }
    async getActiveShareLinks(req) {
        return this.sharingService.getActiveShareLinks(req.user.tenantId, req.user.id);
    }
    async revokeShareLink(req, token) {
        return this.sharingService.revokeShareLink(req.user.tenantId, req.user.id, token);
    }
    async accessSharedContent(token) {
        return this.sharingService.accessSharedContent(token);
    }
};
exports.SharingController = SharingController;
__decorate([
    (0, common_1.Post)('create-link'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SharingController.prototype, "createShareLink", null);
__decorate([
    (0, common_1.Get)('active-links'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SharingController.prototype, "getActiveShareLinks", null);
__decorate([
    (0, common_1.Post)('revoke/:token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SharingController.prototype, "revokeShareLink", null);
__decorate([
    (0, common_1.Get)('access/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SharingController.prototype, "accessSharedContent", null);
exports.SharingController = SharingController = __decorate([
    (0, common_1.Controller)('sharing'),
    __metadata("design:paramtypes", [sharing_service_1.SharingService])
], SharingController);
//# sourceMappingURL=sharing.controller.js.map