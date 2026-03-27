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
exports.MarController = void 0;
const common_1 = require("@nestjs/common");
const mar_service_1 = require("./mar.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let MarController = class MarController {
    marService;
    constructor(marService) {
        this.marService = marService;
    }
    getUserContext(req) {
        return {
            userId: req.user.id,
            role: req.user.role,
            employeeId: req.user.employee?.id,
        };
    }
    async createMarEntry(req, body) {
        const userContext = this.getUserContext(req);
        return this.marService.createMarEntry(req.user.tenantId, req.user.id, body.employeeId, {
            medicationName: body.medicationName,
            scheduledTime: new Date(body.scheduledTime),
            participantId: body.participantId,
        }, userContext);
    }
    async recordOutcome(req, id, body) {
        const userContext = this.getUserContext(req);
        return this.marService.recordOutcome(req.user.tenantId, req.user.id, id, {
            ...body,
            outcomeTime: body.outcomeTime ? new Date(body.outcomeTime) : undefined,
        }, userContext);
    }
    async lockEntry(req, id) {
        const userContext = this.getUserContext(req);
        return this.marService.lockEntry(req.user.tenantId, req.user.id, id, userContext);
    }
    async getMarEntries(req, employeeId, outcome, participantId, startDate, endDate) {
        const userContext = this.getUserContext(req);
        return this.marService.getMarEntries(req.user.tenantId, req.user.id, {
            employeeId,
            outcome,
            participantId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }, userContext);
    }
    async getMarEntry(req, id) {
        const userContext = this.getUserContext(req);
        return this.marService.getMarEntry(req.user.tenantId, id, userContext);
    }
    async exportMarEntries(req, body) {
        const userContext = this.getUserContext(req);
        return this.marService.exportMarEntries(req.user.tenantId, req.user.id, new Date(body.startDate), new Date(body.endDate), { employeeId: body.employeeId, participantId: body.participantId }, userContext);
    }
};
exports.MarController = MarController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "createMarEntry", null);
__decorate([
    (0, common_1.Post)(':id/outcome'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "recordOutcome", null);
__decorate([
    (0, common_1.Post)(':id/lock'),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'supervisor'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "lockEntry", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('outcome')),
    __param(3, (0, common_1.Query)('participantId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "getMarEntries", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "getMarEntry", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'supervisor'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarController.prototype, "exportMarEntries", null);
exports.MarController = MarController = __decorate([
    (0, common_1.Controller)('mar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mar_service_1.MarService])
], MarController);
//# sourceMappingURL=mar.controller.js.map