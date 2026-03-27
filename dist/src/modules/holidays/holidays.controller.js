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
exports.HolidaysController = void 0;
const common_1 = require("@nestjs/common");
const holidays_service_1 = require("./holidays.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const holidays_dto_1 = require("./dto/holidays.dto");
let HolidaysController = class HolidaysController {
    holidaysService;
    constructor(holidaysService) {
        this.holidaysService = holidaysService;
    }
    async createHoliday(req, dto) {
        return this.holidaysService.createHoliday(req.user.tenantId, dto, req.user.id);
    }
    async getHolidays(req, query) {
        return this.holidaysService.getHolidays(req.user.tenantId, query);
    }
    async getHoliday(req, id) {
        return this.holidaysService.getHoliday(req.user.tenantId, id);
    }
    async updateHoliday(req, id, dto) {
        return this.holidaysService.updateHoliday(req.user.tenantId, id, dto, req.user.id);
    }
    async disableHoliday(req, id) {
        return this.holidaysService.disableHoliday(req.user.tenantId, id, req.user.id);
    }
    async assignHoliday(req, id, dto) {
        return this.holidaysService.assignHoliday(req.user.tenantId, id, dto, req.user.id);
    }
    async getHolidayAssignments(req, id) {
        return this.holidaysService.getHolidayAssignments(req.user.tenantId, id);
    }
    async removeAssignment(req, assignmentId) {
        return this.holidaysService.removeAssignment(req.user.tenantId, assignmentId, req.user.id);
    }
    async getUpcomingHolidays(req) {
        return this.holidaysService.getUpcomingHolidays(req.user.tenantId);
    }
    async getAllDepartments(req) {
        return this.holidaysService.getAllDepartments(req.user.tenantId);
    }
    async getAllLocations(req) {
        return this.holidaysService.getAllLocations(req.user.tenantId);
    }
};
exports.HolidaysController = HolidaysController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, holidays_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, holidays_dto_1.HolidayQueryDto]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getHolidays", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getHoliday", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, holidays_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "updateHoliday", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "disableHoliday", null);
__decorate([
    (0, common_1.Post)(':id/assignments'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, holidays_dto_1.AssignHolidayDto]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "assignHoliday", null);
__decorate([
    (0, common_1.Get)(':id/assignments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getHolidayAssignments", null);
__decorate([
    (0, common_1.Delete)('assignments/:assignmentId'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "removeAssignment", null);
__decorate([
    (0, common_1.Get)('upcoming/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getUpcomingHolidays", null);
__decorate([
    (0, common_1.Get)('admin/departments'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getAllDepartments", null);
__decorate([
    (0, common_1.Get)('admin/locations'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "getAllLocations", null);
exports.HolidaysController = HolidaysController = __decorate([
    (0, common_1.Controller)('holidays'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [holidays_service_1.HolidaysService])
], HolidaysController);
//# sourceMappingURL=holidays.controller.js.map