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
var OnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const onboarding_state_machine_service_1 = require("./onboarding-state-machine.service");
const audit_logger_service_1 = require("../../modules/audit-logs/audit-logger.service");
const email_service_1 = require("../email/email.service");
let OnboardingService = OnboardingService_1 = class OnboardingService {
    prisma;
    stateMachine;
    auditLogger;
    emailService;
    logger = new common_1.Logger(OnboardingService_1.name);
    constructor(prisma, stateMachine, auditLogger, emailService) {
        this.prisma = prisma;
        this.stateMachine = stateMachine;
        this.auditLogger = auditLogger;
        this.emailService = emailService;
    }
    async getOnboardingByToken(secureToken) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { secureToken },
            include: {
                candidate: true,
                packet: true,
                taskStatuses: {
                    include: { task: true },
                    orderBy: { task: { order: 'asc' } },
                },
            },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.tokenExpiresAt < new Date()) {
            throw new common_1.ForbiddenException('Onboarding link has expired');
        }
        const progress = await this.stateMachine.calculateProgress(onboarding.id);
        return {
            ...onboarding,
            progressPercent: progress,
        };
    }
    async getTask(onboardingId, taskId, tenantId) {
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true, onboarding: { include: { candidate: true } } },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        return taskStatus;
    }
    async saveTaskDraft(onboardingId, taskId, tenantId, submissionData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.currentState === 'employee_active') {
            throw new common_1.BadRequestException('Onboarding already completed');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId } },
            create: {
                onboardingId,
                taskId,
                status: 'draft',
                submissionData: JSON.stringify(submissionData),
            },
            update: {
                submissionData: JSON.stringify(submissionData),
            },
        });
        return taskStatus;
    }
    async submitTask(onboardingId, taskId, tenantId, submissionData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.currentState === 'employee_active') {
            throw new common_1.BadRequestException('Onboarding already completed');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { id: taskId, tenantId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId } },
            create: {
                onboardingId,
                taskId,
                status: 'submitted',
                submissionData: JSON.stringify(submissionData),
                submittedAt: new Date(),
            },
            update: {
                status: 'submitted',
                submissionData: JSON.stringify(submissionData),
                submittedAt: new Date(),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'TASK_SUBMITTED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: task.name, taskType: task.type },
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        return taskStatus;
    }
    async approveTask(onboardingId, taskId, tenantId, userId, comment) {
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        if (taskStatus.status !== 'submitted') {
            throw new common_1.BadRequestException('Task must be in submitted status to approve');
        }
        const updated = await this.prisma.employeeOnboardingTaskStatus.update({
            where: { id: taskStatus.id },
            data: {
                status: 'approved',
                reviewedAt: new Date(),
                reviewedByUserId: userId,
                reviewComment: comment,
            },
        });
        await this.auditLogger.log({
            tenantId,
            userId,
            action: 'TASK_APPROVED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: taskStatus.task.name, comment },
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { candidate: true },
        });
        if (onboarding?.candidate) {
            await this.emailService.sendTaskApprovalNotification(onboarding.candidate.email, taskStatus.task.name);
        }
        return updated;
    }
    async rejectTask(onboardingId, taskId, tenantId, userId, comment) {
        if (!comment) {
            throw new common_1.BadRequestException('Rejection comment is required');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        const updated = await this.prisma.employeeOnboardingTaskStatus.update({
            where: { id: taskStatus.id },
            data: {
                status: 'rejected',
                reviewedAt: new Date(),
                reviewedByUserId: userId,
                reviewComment: comment,
            },
        });
        await this.auditLogger.log({
            tenantId,
            userId,
            action: 'TASK_REJECTED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: taskStatus.task.name, comment },
        });
        await this.transitionToInProgress(onboardingId, tenantId);
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { candidate: true },
        });
        if (onboarding?.candidate) {
            await this.emailService.sendTaskRejectionNotification(onboarding.candidate.email, taskStatus.task.name, comment);
        }
        return updated;
    }
    async checkAndAdvanceState(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { taskStatuses: true },
        });
        if (!onboarding)
            return;
        const allSubmitted = onboarding.taskStatuses.every((ts) => ts.status === 'submitted' || ts.status === 'approved');
        if (allSubmitted && onboarding.currentState === 'in_progress') {
            await this.stateMachine.transitionToState(onboardingId, 'pending_hr_review');
        }
    }
    async transitionToInProgress(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
        });
        if (!onboarding)
            return;
        if (onboarding.currentState === 'in_progress' || onboarding.currentState === 'pending_hr_review') {
            await this.stateMachine.transitionToState(onboardingId, 'in_progress');
        }
    }
    async getProgress(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: {
                taskStatuses: { include: { task: true } },
            },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const progress = await this.stateMachine.calculateProgress(onboardingId);
        const taskBreakdown = onboarding.taskStatuses.map((ts) => ({
            taskId: ts.taskId,
            taskName: ts.task.name,
            taskType: ts.task.type,
            status: ts.status,
            isRequired: ts.task.isRequired,
        }));
        return {
            onboardingId,
            currentState: onboarding.currentState,
            progressPercent: progress,
            tasks: taskBreakdown,
        };
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = OnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService,
        onboarding_state_machine_service_1.OnboardingStateMachine,
        audit_logger_service_1.AuditLogger,
        email_service_1.EmailService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map