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
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const patients_service_1 = require("./patients.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const patients_dto_1 = require("./dto/patients.dto");
let PatientsController = class PatientsController {
    patientsService;
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    async createPatient(req, dto) {
        return this.patientsService.createPatient(req.user.tenantId, dto, req.user.id);
    }
    async getPatients(req, query) {
        return this.patientsService.getPatients(req.user.tenantId, query);
    }
    async getPatient(req, id) {
        return this.patientsService.getPatient(req.user.tenantId, id);
    }
    async updatePatient(req, id, dto) {
        return this.patientsService.updatePatient(req.user.tenantId, id, dto, req.user.id);
    }
    async deactivatePatient(req, id) {
        return this.patientsService.deactivatePatient(req.user.tenantId, id, req.user.id);
    }
    async getPatientTimeline(req, id) {
        return this.patientsService.getPatientTimeline(req.user.tenantId, id);
    }
    async addMedicalReport(req, id, dto) {
        return this.patientsService.addMedicalReport(req.user.tenantId, id, dto, req.user.id);
    }
    async getMedicalReports(req, id) {
        return this.patientsService.getMedicalReports(req.user.tenantId, id);
    }
    async approveMedicalReport(req, reportId, dto) {
        return this.patientsService.approveMedicalReport(req.user.tenantId, reportId, dto, req.user.id);
    }
    async addMedicine(req, id, dto) {
        return this.patientsService.addMedicine(req.user.tenantId, id, dto, req.user.id);
    }
    async updateMedicine(req, medicineId, dto) {
        return this.patientsService.updateMedicine(req.user.tenantId, medicineId, dto, req.user.id);
    }
    async stopMedicine(req, medicineId, body) {
        return this.patientsService.stopMedicine(req.user.tenantId, medicineId, req.user.id, body.reason);
    }
    async getMedicines(req, id) {
        return this.patientsService.getMedicines(req.user.tenantId, id);
    }
    async createAppointment(req, id, dto) {
        return this.patientsService.createPatientAppointment(req.user.tenantId, id, dto, req.user.id);
    }
    async getPatientAppointments(req, id) {
        return this.patientsService.getPatientAppointments(req.user.tenantId, id);
    }
    async getAppointments(req, query) {
        return this.patientsService.getAppointments(req.user.tenantId, query);
    }
    async updateAppointment(req, appointmentId, dto) {
        return this.patientsService.updateAppointment(req.user.tenantId, appointmentId, dto, req.user.id);
    }
    async cancelAppointment(req, appointmentId, body) {
        return this.patientsService.cancelAppointment(req.user.tenantId, appointmentId, body.reason, req.user.id);
    }
    async assignStaff(req, id, dto) {
        return this.patientsService.assignStaff(req.user.tenantId, id, dto, req.user.id);
    }
    async removeStaff(req, id, staffId) {
        return this.patientsService.removeStaff(req.user.tenantId, id, staffId, req.user.id);
    }
    async getAllStaff(req) {
        return this.patientsService.getAllStaff(req.user.tenantId);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, patients_dto_1.CreatePatientDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "createPatient", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, patients_dto_1.PatientQueryDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatients", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatient", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.UpdatePatientDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updatePatient", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "deactivatePatient", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatientTimeline", null);
__decorate([
    (0, common_1.Post)(':id/medical-reports'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.MedicalReportDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "addMedicalReport", null);
__decorate([
    (0, common_1.Get)(':id/medical-reports'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getMedicalReports", null);
__decorate([
    (0, common_1.Patch)('medical-reports/:reportId/approve'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('reportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.ApproveMedicalReportDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "approveMedicalReport", null);
__decorate([
    (0, common_1.Post)(':id/medicines'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.MedicineDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "addMedicine", null);
__decorate([
    (0, common_1.Patch)('medicines/:medicineId'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('medicineId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.UpdateMedicineDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updateMedicine", null);
__decorate([
    (0, common_1.Post)('medicines/:medicineId/stop'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('medicineId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "stopMedicine", null);
__decorate([
    (0, common_1.Get)(':id/medicines'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getMedicines", null);
__decorate([
    (0, common_1.Post)(':id/appointments'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.AppointmentDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "createAppointment", null);
__decorate([
    (0, common_1.Get)(':id/appointments'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatientAppointments", null);
__decorate([
    (0, common_1.Get)('appointments/all'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, patients_dto_1.AppointmentQueryDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getAppointments", null);
__decorate([
    (0, common_1.Patch)('appointments/:appointmentId'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('appointmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.UpdateAppointmentDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updateAppointment", null);
__decorate([
    (0, common_1.Post)('appointments/:appointmentId/cancel'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('appointmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "cancelAppointment", null);
__decorate([
    (0, common_1.Post)(':id/staff'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patients_dto_1.AssignStaffDto]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "assignStaff", null);
__decorate([
    (0, common_1.Delete)(':id/staff/:staffId'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "removeStaff", null);
__decorate([
    (0, common_1.Get)('staff/all'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'manager', 'employee'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getAllStaff", null);
exports.PatientsController = PatientsController = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map