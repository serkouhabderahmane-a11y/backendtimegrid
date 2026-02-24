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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrDashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let HrDashboardService = class HrDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(tenantId) {
        const [totalCandidates, candidatesByState, pendingApprovals, activeEmployees,] = await Promise.all([
            this.prisma.candidate.count({ where: { tenantId } }),
            this.prisma.candidate.groupBy({
                by: ['state'],
                where: { tenantId },
                _count: true,
            }),
            this.prisma.employeeOnboardingTaskStatus.count({
                where: {
                    onboarding: { tenantId },
                    status: 'submitted',
                },
            }),
            this.prisma.employee.count({
                where: { tenantId, onboardingStatus: 'employee_active' },
            }),
        ]);
        const stateCounts = {};
        candidatesByState.forEach((item) => {
            stateCounts[item.state] = item._count;
        });
        return {
            totalCandidates,
            activeEmployees,
            pendingApprovals,
            candidatesByState: stateCounts,
        };
    }
    async getCandidatesByState(tenantId, state) {
        return this.prisma.candidate.findMany({
            where: { tenantId, state: state },
            include: {
                location: true,
                department: true,
                onboarding: {
                    include: {
                        taskStatuses: { include: { task: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApprovalQueue(tenantId) {
        return this.prisma.employeeOnboardingTaskStatus.findMany({
            where: {
                onboarding: { tenantId },
                status: 'submitted',
            },
            include: {
                task: true,
                onboarding: {
                    include: { candidate: true },
                },
            },
            orderBy: { submittedAt: 'asc' },
        });
    }
    async getRejectedTasks(tenantId) {
        return this.prisma.employeeOnboardingTaskStatus.findMany({
            where: {
                onboarding: { tenantId },
                status: 'rejected',
            },
            include: {
                task: true,
                onboarding: {
                    include: { candidate: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getExpiredDocuments(tenantId) {
        const now = new Date();
        return this.prisma.document.findMany({
            where: {
                tenantId,
                expiresAt: { lte: now },
            },
            include: { candidate: true },
            orderBy: { expiresAt: 'asc' },
        });
    }
    async getExpiringDocuments(tenantId, daysAhead = 30) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.prisma.document.findMany({
            where: {
                tenantId,
                expiresAt: {
                    gt: now,
                    lte: futureDate,
                },
            },
            include: { candidate: true },
            orderBy: { expiresAt: 'asc' },
        });
    }
};
exports.HrDashboardService = HrDashboardService;
exports.HrDashboardService = HrDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], HrDashboardService);
//# sourceMappingURL=hr-dashboard.service.js.map