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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const attendance_dto_1 = require("./dto/attendance.dto");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async clockIn(req, dto) {
        return this.attendanceService.clockIn(req.user.id, req.user.tenantId, dto, req);
    }
    async clockOut(req, dto) {
        return this.attendanceService.clockOut(req.user.id, req.user.tenantId, dto, req);
    }
    async getTodayAttendance(req) {
        return this.attendanceService.getTodayAttendance(req.user.id, req.user.tenantId);
    }
    async getMyAttendance(req, query) {
        return this.attendanceService.getMyAttendance(req.user.id, req.user.tenantId, query);
    }
    async getMyStats(req, query) {
        return this.attendanceService.getMyStats(req.user.id, req.user.tenantId, query);
    }
    async getAdminAttendance(req, query) {
        return this.attendanceService.getAdminAttendance(req.user.tenantId, query);
    }
    async getAdminStats(req, query) {
        return this.attendanceService.getAdminStats(req.user.tenantId, query);
    }
    async exportAttendance(req, query) {
        return this.attendanceService.exportAttendance(req.user.tenantId, query);
    }
    async getAllEmployees(req) {
        return this.attendanceService.getAllEmployees(req.user.tenantId);
    }
    async getAllDepartments(req) {
        return this.attendanceService.getAllDepartments(req.user.tenantId);
    }
    async getEmployeeAttendance(req, employeeId, query) {
        return this.attendanceService.getEmployeeAttendance(req.user.tenantId, employeeId, query);
    }
    async adjustAttendance(req, id, dto) {
        return this.attendanceService.adjustAttendance(req.user.tenantId, id, dto, req.user.id, req);
    }
    async getAdjustments(req, id) {
        return this.attendanceService.getAdjustments(req.user.tenantId, id);
    }
    async getAttendanceLogs(req, id) {
        return this.attendanceService.getAttendanceLogs(req.user.tenantId, id);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('clock-in'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.ClockInDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.ClockOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Get)('today'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getTodayAttendance", null);
__decorate([
    (0, common_1.Get)('my-attendance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Get)('my-stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyStats", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAdminAttendance", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('admin/export'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "exportAttendance", null);
__decorate([
    (0, common_1.Get)('admin/employees'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAllEmployees", null);
__decorate([
    (0, common_1.Get)('admin/departments'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAllDepartments", null);
__decorate([
    (0, common_1.Get)('admin/employee/:employeeId'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, attendance_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeAttendance", null);
__decorate([
    (0, common_1.Patch)('admin/:id/adjust'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, attendance_dto_1.AdjustmentDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "adjustAttendance", null);
__decorate([
    (0, common_1.Get)(':id/adjustments'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAdjustments", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceLogs", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map