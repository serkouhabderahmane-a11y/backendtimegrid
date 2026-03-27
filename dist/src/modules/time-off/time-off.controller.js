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
exports.TimeOffController = void 0;
const common_1 = require("@nestjs/common");
const time_off_service_1 = require("./time-off.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const time_off_dto_1 = require("./dto/time-off.dto");
let TimeOffController = class TimeOffController {
    timeOffService;
    constructor(timeOffService) {
        this.timeOffService = timeOffService;
    }
    async createRequest(req, dto) {
        return this.timeOffService.createRequest(req.user.id, req.user.tenantId, dto, req);
    }
    async getMyRequests(req, query) {
        return this.timeOffService.getMyRequests(req.user.id, req.user.tenantId, query);
    }
    async getMyBalances(req) {
        return this.timeOffService.getMyBalances(req.user.id, req.user.tenantId);
    }
    async cancelRequest(req, id, dto) {
        return this.timeOffService.cancelMyRequest(req.user.id, req.user.tenantId, id, dto, req);
    }
    async getAdminRequests(req, query) {
        return this.timeOffService.getAdminRequests(req.user.tenantId, query);
    }
    async reviewRequest(req, id, dto) {
        return this.timeOffService.reviewRequest(req.user.tenantId, id, dto, req.user.id, req);
    }
    async getLeaveCalendar(req, query) {
        return this.timeOffService.getLeaveCalendar(req.user.tenantId, query);
    }
    async getAdminStats(req, query) {
        return this.timeOffService.getAdminStats(req.user.tenantId, query);
    }
    async getAllEmployees(req) {
        return this.timeOffService.getAllEmployees(req.user.tenantId);
    }
    async getEmployeeBalances(req, employeeId) {
        return this.timeOffService.getEmployeeBalances(req.user.tenantId, employeeId);
    }
    async createOrUpdateBalance(req, employeeId, dto) {
        return this.timeOffService.createOrUpdateBalance(req.user.tenantId, employeeId, dto, req.user.id, req);
    }
    async adjustBalance(req, balanceId, dto) {
        return this.timeOffService.adjustBalance(req.user.tenantId, balanceId, dto, req.user.id, req);
    }
    async getRequestLogs(req, id) {
        return this.timeOffService.getRequestLogs(req.user.tenantId, id);
    }
    async getBalanceHistory(req, balanceId) {
        return this.timeOffService.getBalanceHistory(req.user.tenantId, balanceId);
    }
};
exports.TimeOffController = TimeOffController;
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, time_off_dto_1.CreateTimeOffRequestDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('requests/my'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, time_off_dto_1.TimeOffQueryDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('balances/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getMyBalances", null);
__decorate([
    (0, common_1.Post)('requests/:id/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, time_off_dto_1.CancelTimeOffDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "cancelRequest", null);
__decorate([
    (0, common_1.Get)('admin/requests'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, time_off_dto_1.TimeOffQueryDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getAdminRequests", null);
__decorate([
    (0, common_1.Patch)('admin/requests/:id/review'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, time_off_dto_1.ReviewTimeOffDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "reviewRequest", null);
__decorate([
    (0, common_1.Get)('admin/calendar'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, time_off_dto_1.TimeOffQueryDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getLeaveCalendar", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, time_off_dto_1.TimeOffQueryDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('admin/employees'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getAllEmployees", null);
__decorate([
    (0, common_1.Get)('admin/employees/:employeeId/balances'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getEmployeeBalances", null);
__decorate([
    (0, common_1.Post)('admin/employees/:employeeId/balances'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, time_off_dto_1.CreateBalanceDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "createOrUpdateBalance", null);
__decorate([
    (0, common_1.Patch)('admin/balances/:balanceId'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('balanceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, time_off_dto_1.AdjustBalanceDto]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "adjustBalance", null);
__decorate([
    (0, common_1.Get)('requests/:id/logs'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getRequestLogs", null);
__decorate([
    (0, common_1.Get)('balances/:balanceId/history'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('balanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeOffController.prototype, "getBalanceHistory", null);
exports.TimeOffController = TimeOffController = __decorate([
    (0, common_1.Controller)('time-off'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [time_off_service_1.TimeOffService])
], TimeOffController);
//# sourceMappingURL=time-off.controller.js.map