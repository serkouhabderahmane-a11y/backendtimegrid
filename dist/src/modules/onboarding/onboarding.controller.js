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
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const onboarding_service_1 = require("./onboarding.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_guard_2 = require("../../common/guards/roles.guard");
let OnboardingController = class OnboardingController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async getByToken(secureToken) {
        return this.onboardingService.getOnboardingByToken(secureToken);
    }
    async saveDraft(onboardingId, taskId, tenantId, submissionData) {
        return this.onboardingService.saveTaskDraft(onboardingId, taskId, tenantId, submissionData);
    }
    async submitTask(onboardingId, taskId, tenantId, submissionData) {
        return this.onboardingService.submitTask(onboardingId, taskId, tenantId, submissionData);
    }
    async approveTask(onboardingId, taskId, tenantId, req, comment) {
        return this.onboardingService.approveTask(onboardingId, taskId, tenantId, req.user.id, comment);
    }
    async rejectTask(onboardingId, taskId, tenantId, req, comment) {
        return this.onboardingService.rejectTask(onboardingId, taskId, tenantId, req.user.id, comment);
    }
    async getProgress(onboardingId, tenantId) {
        return this.onboardingService.getProgress(onboardingId, tenantId);
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Get)('token/:secureToken'),
    __param(0, (0, common_1.Param)('secureToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getByToken", null);
__decorate([
    (0, common_1.Post)(':onboardingId/tasks/:taskId/draft'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)('tenantId')),
    __param(3, (0, common_1.Body)('submissionData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Post)(':onboardingId/tasks/:taskId/submit'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)('tenantId')),
    __param(3, (0, common_1.Body)('submissionData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "submitTask", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('admin', 'hr'),
    (0, common_1.Post)(':onboardingId/tasks/:taskId/approve'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)('tenantId')),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "approveTask", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_2.Roles)('admin', 'hr'),
    (0, common_1.Post)(':onboardingId/tasks/:taskId/reject'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)('tenantId')),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "rejectTask", null);
__decorate([
    (0, common_1.Get)(':onboardingId/progress'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getProgress", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, common_1.Controller)('onboarding'),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map