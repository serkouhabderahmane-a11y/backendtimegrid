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
exports.TimeEntriesController = void 0;
const common_1 = require("@nestjs/common");
const time_entries_service_1 = require("./time-entries.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TimeEntriesController = class TimeEntriesController {
    timeEntriesService;
    constructor(timeEntriesService) {
        this.timeEntriesService = timeEntriesService;
    }
    async clockIn(req) {
        return this.timeEntriesService.clockIn(req.user.id, req.user.tenantId);
    }
    async clockOut(req) {
        return this.timeEntriesService.clockOut(req.user.id, req.user.tenantId);
    }
    async getTodayEntry(req) {
        return this.timeEntriesService.getTodayEntry(req.user.id, req.user.tenantId);
    }
    async getEntries(req, startDate, endDate) {
        return this.timeEntriesService.getEntries(req.user.id, req.user.tenantId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getAllTimesheets(req, payPeriodId) {
        return this.timeEntriesService.getAllTimesheets(req.user.tenantId, payPeriodId);
    }
    async assignToPayPeriod(req, body) {
        return this.timeEntriesService.assignToPayPeriod(req.user.tenantId, body.timesheetId, body.payPeriodId);
    }
    async approveTimesheet(req, id) {
        return this.timeEntriesService.approveTimesheet(req.user.tenantId, id, req.user.id);
    }
    async rejectTimesheet(req, id, body) {
        return this.timeEntriesService.rejectTimesheet(req.user.tenantId, id, req.user.id, body.reason);
    }
    async reviewTimesheet(req, id) {
        return this.timeEntriesService.reviewTimesheet(req.user.tenantId, id, req.user.id);
    }
    async getTimesheetsForPayPeriod(req, payPeriodId) {
        return this.timeEntriesService.getTimesheetsForPayPeriod(req.user.tenantId, payPeriodId);
    }
};
exports.TimeEntriesController = TimeEntriesController;
__decorate([
    (0, common_1.Post)('clock-in'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Get)('today'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "getTodayEntry", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "getEntries", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('payPeriodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "getAllTimesheets", null);
__decorate([
    (0, common_1.Post)('admin/assign'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "assignToPayPeriod", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "approveTimesheet", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "rejectTimesheet", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "reviewTimesheet", null);
__decorate([
    (0, common_1.Get)('pay-period/:payPeriodId'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('payPeriodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TimeEntriesController.prototype, "getTimesheetsForPayPeriod", null);
exports.TimeEntriesController = TimeEntriesController = __decorate([
    (0, common_1.Controller)('time-entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [time_entries_service_1.TimeEntriesService])
], TimeEntriesController);
//# sourceMappingURL=time-entries.controller.js.map