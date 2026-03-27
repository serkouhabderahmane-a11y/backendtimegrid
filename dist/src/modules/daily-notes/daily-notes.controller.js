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
exports.DailyNotesController = void 0;
const common_1 = require("@nestjs/common");
const daily_notes_service_1 = require("./daily-notes.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DailyNotesController = class DailyNotesController {
    dailyNotesService;
    constructor(dailyNotesService) {
        this.dailyNotesService = dailyNotesService;
    }
    getUserContext(req) {
        return {
            userId: req.user.id,
            role: req.user.role,
            employeeId: req.user.employee?.id,
        };
    }
    async createNote(req, body) {
        const userContext = this.getUserContext(req);
        const employeeId = body.employeeId || userContext.employeeId;
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }
        return this.dailyNotesService.createNote(req.user.tenantId, req.user.id, employeeId, {
            content: body.content,
            date: new Date(body.date),
            attachments: body.attachments,
            participantId: body.participantId,
        }, userContext);
    }
    async updateNote(req, id, body) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.updateNote(req.user.tenantId, req.user.id, id, {
            content: body.content,
            date: body.date ? new Date(body.date) : undefined,
            attachments: body.attachments,
            participantId: body.participantId,
        }, userContext);
    }
    async submitNote(req, id) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.submitNote(req.user.tenantId, req.user.id, id, userContext);
    }
    async getNotes(req, employeeId, status, participantId, startDate, endDate) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.getNotes(req.user.tenantId, req.user.id, {
            employeeId,
            status,
            participantId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }, userContext);
    }
    async getNote(req, id) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.getNote(req.user.tenantId, id, userContext);
    }
    async reviewNote(req, id) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.reviewNote(req.user.tenantId, req.user.id, id, userContext);
    }
    async lockNote(req, id) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.lockNote(req.user.tenantId, req.user.id, id, userContext);
    }
    async exportNotes(req, body) {
        const userContext = this.getUserContext(req);
        return this.dailyNotesService.exportNotes(req.user.tenantId, req.user.id, new Date(body.startDate), new Date(body.endDate), { participantId: body.participantId }, userContext);
    }
};
exports.DailyNotesController = DailyNotesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "createNote", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "submitNote", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('participantId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "getNote", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'supervisor'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "reviewNote", null);
__decorate([
    (0, common_1.Post)(':id/lock'),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'supervisor'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "lockNote", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'supervisor'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DailyNotesController.prototype, "exportNotes", null);
exports.DailyNotesController = DailyNotesController = __decorate([
    (0, common_1.Controller)('daily-notes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [daily_notes_service_1.DailyNotesService])
], DailyNotesController);
//# sourceMappingURL=daily-notes.controller.js.map