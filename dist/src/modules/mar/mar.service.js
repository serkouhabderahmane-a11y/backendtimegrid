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
exports.MarService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let MarService = class MarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAudit(tenantId, userId, action, entityType, entityId, metadata) {
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType,
                entityId,
                metadata: JSON.stringify(metadata),
            },
        });
    }
    canAccessMar(userContext) {
        if (userContext.role === 'hr') {
            return false;
        }
        return true;
    }
    filterByAccess(userContext, baseWhere) {
        if (userContext.role === 'employee' && userContext.employeeId) {
            return { ...baseWhere, employeeId: userContext.employeeId };
        }
        return baseWhere;
    }
    async createMarEntry(tenantId, userId, employeeId, data, userContext) {
        if (!this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.prisma.medicationAdministrationRecord.create({
            data: {
                tenantId,
                employeeId,
                medicationName: data.medicationName,
                scheduledTime: data.scheduledTime,
                outcome: 'scheduled',
                participantId: data.participantId,
            },
        });
    }
    async recordOutcome(tenantId, userId, id, data, userContext) {
        if (!this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const entry = await this.prisma.medicationAdministrationRecord.findFirst({
            where: { id, tenantId },
        });
        if (!entry) {
            throw new common_1.NotFoundException('MAR entry not found');
        }
        if (userContext.role === 'employee' && userContext.employeeId !== entry.employeeId) {
            throw new common_1.ForbiddenException('Cannot modify other employees\' MAR entries');
        }
        if (entry.outcome === 'locked') {
            throw new common_1.ForbiddenException('Cannot modify locked MAR entry');
        }
        const updated = await this.prisma.medicationAdministrationRecord.update({
            where: { id },
            data: {
                outcome: data.outcome,
                outcomeTime: data.outcomeTime || new Date(),
                reasonNotGiven: data.reasonNotGiven,
                administeredBy: userId,
            },
        });
        await this.logAudit(tenantId, userId, 'RECORD_MAR_OUTCOME', 'MedicationAdministrationRecord', id, {
            outcome: data.outcome,
        });
        return updated;
    }
    async autoLockEntry(tenantId, id) {
        const entry = await this.prisma.medicationAdministrationRecord.findFirst({
            where: { id, tenantId },
        });
        if (!entry || entry.outcome === 'locked') {
            return entry;
        }
        return this.prisma.medicationAdministrationRecord.update({
            where: { id },
            data: {
                outcome: 'locked',
                lockedAt: new Date(),
                lockedBy: 'system',
            },
        });
    }
    async lockEntry(tenantId, userId, id, userContext) {
        if (!this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const entry = await this.prisma.medicationAdministrationRecord.findFirst({
            where: { id, tenantId },
        });
        if (!entry) {
            throw new common_1.NotFoundException('MAR entry not found');
        }
        if (entry.outcome === 'locked') {
            throw new common_1.ForbiddenException('MAR entry is already locked');
        }
        const updated = await this.prisma.medicationAdministrationRecord.update({
            where: { id },
            data: {
                outcome: 'locked',
                lockedAt: new Date(),
                lockedBy: userId,
            },
        });
        await this.logAudit(tenantId, userId, 'LOCK_MAR_ENTRY', 'MedicationAdministrationRecord', id, {
            lockedAt: new Date(),
        });
        return updated;
    }
    async getMarEntries(tenantId, userId, params, userContext) {
        if (!this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const where = this.filterByAccess(userContext, { tenantId });
        if (params.employeeId)
            where.employeeId = params.employeeId;
        if (params.outcome)
            where.outcome = params.outcome;
        if (params.participantId)
            where.participantId = params.participantId;
        if (params.startDate && params.endDate) {
            where.scheduledTime = { gte: params.startDate, lte: params.endDate };
        }
        return this.prisma.medicationAdministrationRecord.findMany({
            where,
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { scheduledTime: 'desc' },
        });
    }
    async getMarEntry(tenantId, id, userContext) {
        if (!this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const entry = await this.prisma.medicationAdministrationRecord.findFirst({
            where: { id, tenantId },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('MAR entry not found');
        }
        if (userContext.role === 'employee' && userContext.employeeId !== entry.employeeId) {
            throw new common_1.ForbiddenException('Cannot view other employees\' MAR entries');
        }
        return entry;
    }
    async exportMarEntries(tenantId, userId, startDate, endDate, params, userContext) {
        if (userContext && !this.canAccessMar(userContext)) {
            throw new common_1.ForbiddenException('HR role cannot access MAR records');
        }
        const where = {
            tenantId,
            scheduledTime: { gte: startDate, lte: endDate },
        };
        if (params?.participantId)
            where.participantId = params.participantId;
        if (params?.employeeId)
            where.employeeId = params.employeeId;
        if (userContext?.role === 'employee' && userContext.employeeId) {
            where.employeeId = userContext.employeeId;
        }
        const entries = await this.prisma.medicationAdministrationRecord.findMany({
            where,
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { scheduledTime: 'asc' },
        });
        const exportData = entries.map(entry => ({
            medicationName: entry.medicationName,
            scheduledTime: entry.scheduledTime,
            outcome: entry.outcome,
            outcomeTime: entry.outcomeTime,
            reasonNotGiven: entry.reasonNotGiven,
            staffReference: entry.administeredBy,
            participantId: entry.participantId,
            employee: {
                id: entry.employeeId,
                name: `${entry.employee.user.firstName} ${entry.employee.user.lastName}`,
            },
            lockedAt: entry.lockedAt,
            lockedBy: entry.lockedBy,
        }));
        await this.logAudit(tenantId, userId, 'EXPORT_MAR', 'MedicationAdministrationRecord', undefined, {
            startDate,
            endDate,
            entriesCount: entries.length,
        });
        return {
            startDate,
            endDate,
            exportDate: new Date(),
            entriesCount: entries.length,
            data: exportData,
        };
    }
};
exports.MarService = MarService;
exports.MarService = MarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], MarService);
//# sourceMappingURL=mar.service.js.map