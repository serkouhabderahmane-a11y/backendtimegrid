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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async createPayPeriod(req, body) {
        return this.payrollService.createPayPeriod(req.user.tenantId, req.user.id, {
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });
    }
    async getPayPeriods(req) {
        return this.payrollService.getPayPeriods(req.user.tenantId);
    }
    async getPayPeriod(req, id) {
        return this.payrollService.getPayPeriod(req.user.tenantId, id);
    }
    async approveTimesheet(req, timeEntryId, body) {
        if (!body.approved && !body.rejectionReason) {
            throw new Error('Rejection reason is required when rejecting a timesheet');
        }
        return this.payrollService.approveTimesheet(req.user.tenantId, req.user.id, timeEntryId, body);
    }
    async lockPayPeriod(req, id) {
        return this.payrollService.lockPayPeriod(req.user.tenantId, req.user.id, id);
    }
    async calculatePayroll(req, id) {
        return this.payrollService.calculatePayroll(req.user.tenantId, req.user.id, id);
    }
    async exportPayroll(req, id, body) {
        return this.payrollService.exportPayroll(req.user.tenantId, req.user.id, id, body.provider, body.format);
    }
    async getAuditLogs(req, entityType, entityId) {
        return this.payrollService.getAuditLogs(req.user.tenantId, entityType, entityId);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('pay-periods'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "createPayPeriod", null);
__decorate([
    (0, common_1.Get)('pay-periods'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayPeriods", null);
__decorate([
    (0, common_1.Get)('pay-periods/:id'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayPeriod", null);
__decorate([
    (0, common_1.Post)('timesheets/:timeEntryId/approve'),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('timeEntryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approveTimesheet", null);
__decorate([
    (0, common_1.Post)('pay-periods/:id/lock'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "lockPayPeriod", null);
__decorate([
    (0, common_1.Post)('pay-periods/:id/calculate'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "calculatePayroll", null);
__decorate([
    (0, common_1.Post)('pay-periods/:id/export'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportPayroll", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getAuditLogs", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map