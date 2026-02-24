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
exports.HrDashboardController = void 0;
const common_1 = require("@nestjs/common");
const hr_dashboard_service_1 = require("./hr-dashboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_guard_2 = require("../../common/guards/roles.guard");
let HrDashboardController = class HrDashboardController {
    hrDashboardService;
    constructor(hrDashboardService) {
        this.hrDashboardService = hrDashboardService;
    }
    async getStats(tenantId) {
        return this.hrDashboardService.getDashboardStats(tenantId);
    }
    async getCandidatesByState(tenantId, state) {
        return this.hrDashboardService.getCandidatesByState(tenantId, state);
    }
    async getApprovalQueue(tenantId) {
        return this.hrDashboardService.getApprovalQueue(tenantId);
    }
    async getRejectedTasks(tenantId) {
        return this.hrDashboardService.getRejectedTasks(tenantId);
    }
    async getExpiredDocuments(tenantId) {
        return this.hrDashboardService.getExpiredDocuments(tenantId);
    }
    async getExpiringDocuments(tenantId, days) {
        return this.hrDashboardService.getExpiringDocuments(tenantId, days ? parseInt(days) : 30);
    }
};
exports.HrDashboardController = HrDashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('candidates/by-state/:state'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getCandidatesByState", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getApprovalQueue", null);
__decorate([
    (0, common_1.Get)('rejected-tasks'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getRejectedTasks", null);
__decorate([
    (0, common_1.Get)('documents/expired'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getExpiredDocuments", null);
__decorate([
    (0, common_1.Get)('documents/expiring'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HrDashboardController.prototype, "getExpiringDocuments", null);
exports.HrDashboardController = HrDashboardController = __decorate([
    (0, common_1.Controller)('tenants/:tenantId/hr-dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('admin', 'hr'),
    __metadata("design:paramtypes", [hr_dashboard_service_1.HrDashboardService])
], HrDashboardController);
//# sourceMappingURL=hr-dashboard.controller.js.map