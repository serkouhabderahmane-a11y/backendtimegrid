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
var OnboardingStateMachine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingStateMachine = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const audit_logger_service_1 = require("../../modules/audit-logs/audit-logger.service");
const ONBOARDING_STATE_ORDER = [
    'candidate_created',
    'packet_assigned',
    'in_progress',
    'pending_hr_review',
    'approved',
    'employee_active',
];
let OnboardingStateMachine = OnboardingStateMachine_1 = class OnboardingStateMachine {
    prisma;
    auditLogger;
    logger = new common_1.Logger(OnboardingStateMachine_1.name);
    constructor(prisma, auditLogger) {
        this.prisma = prisma;
        this.auditLogger = auditLogger;
    }
    async transitionToState(onboardingId, targetState, userId, metadata) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { candidate: true, taskStatuses: true },
        });
        if (!onboarding) {
            throw new common_1.BadRequestException('Onboarding record not found');
        }
        const currentState = onboarding.currentState;
        const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(currentState);
        const targetStateIndex = ONBOARDING_STATE_ORDER.indexOf(targetState);
        if (targetStateIndex === -1) {
            throw new common_1.BadRequestException(`Invalid target state: ${targetState}`);
        }
        if (targetStateIndex !== currentStateIndex + 1) {
            throw new common_1.ForbiddenException(`Cannot transition from ${currentState} to ${targetState}. Must progress through states in order.`);
        }
        const oldState = currentState;
        const newState = targetState;
        let updatedOnboarding;
        if (newState === 'employee_active') {
            updatedOnboarding = await this.activateEmployee(onboarding, userId);
        }
        else {
            updatedOnboarding = await this.prisma.employeeOnboarding.update({
                where: { id: onboardingId },
                data: {
                    currentState: newState,
                    updatedAt: new Date(),
                },
            });
        }
        await this.auditLogger.logStateTransition(onboarding.tenantId, userId, 'EmployeeOnboarding', onboardingId, oldState, newState, metadata);
        await this.prisma.candidate.update({
            where: { id: onboarding.candidateId },
            data: { state: newState },
        });
        return updatedOnboarding;
    }
    async activateEmployee(onboarding, userId) {
        const candidate = onboarding.candidate;
        const passwordHash = await this.generateTempPassword();
        const user = await this.prisma.user.create({
            data: {
                tenantId: onboarding.tenantId,
                email: candidate.email,
                passwordHash,
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                role: 'employee',
            },
        });
        const employee = await this.prisma.employee.create({
            data: {
                userId: user.id,
                tenantId: onboarding.tenantId,
                departmentId: candidate.departmentId,
                locationId: candidate.locationId,
                startDate: candidate.startDate,
                onboardingStatus: 'employee_active',
                canClockIn: true,
            },
        });
        const updatedOnboarding = await this.prisma.employeeOnboarding.update({
            where: { id: onboarding.id },
            data: {
                currentState: 'employee_active',
                activatedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return updatedOnboarding;
    }
    async generateTempPassword() {
        const bcrypt = require('bcryptjs');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return bcrypt.hash(password, 12);
    }
    async canTransitionTo(onboardingId, targetState) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
        });
        if (!onboarding) {
            return false;
        }
        const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(onboarding.currentState);
        const targetStateIndex = ONBOARDING_STATE_ORDER.indexOf(targetState);
        return targetStateIndex === currentStateIndex + 1;
    }
    async getNextState(currentState) {
        const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(currentState);
        if (currentStateIndex === -1 || currentStateIndex >= ONBOARDING_STATE_ORDER.length - 1) {
            return null;
        }
        return ONBOARDING_STATE_ORDER[currentStateIndex + 1];
    }
    async calculateProgress(onboardingId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: {
                taskStatuses: {
                    include: { task: true },
                },
            },
        });
        if (!onboarding || onboarding.taskStatuses.length === 0) {
            return 0;
        }
        const totalTasks = onboarding.taskStatuses.length;
        const completedTasks = onboarding.taskStatuses.filter((ts) => ts.status === 'approved').length;
        return Math.round((completedTasks / totalTasks) * 100);
    }
    async areAllRequiredTasksApproved(onboardingId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: {
                taskStatuses: {
                    include: { task: true },
                },
            },
        });
        if (!onboarding) {
            return false;
        }
        const requiredTasks = onboarding.taskStatuses.filter((ts) => ts.task.isRequired);
        const allApproved = requiredTasks.every((ts) => ts.status === 'approved');
        return allApproved;
    }
};
exports.OnboardingStateMachine = OnboardingStateMachine;
exports.OnboardingStateMachine = OnboardingStateMachine = OnboardingStateMachine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService,
        audit_logger_service_1.AuditLogger])
], OnboardingStateMachine);
//# sourceMappingURL=onboarding-state-machine.service.js.map