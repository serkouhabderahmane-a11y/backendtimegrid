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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let PayrollService = class PayrollService {
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
    async createPayPeriod(tenantId, userId, data) {
        const payPeriod = await this.prisma.payPeriod.create({
            data: {
                tenantId,
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
            },
        });
        await this.logAudit(tenantId, userId, 'CREATE_PAY_PERIOD', 'PayPeriod', payPeriod.id, {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
        });
        return payPeriod;
    }
    async getPayPeriods(tenantId) {
        return this.prisma.payPeriod.findMany({
            where: { tenantId },
            orderBy: { startDate: 'desc' },
        });
    }
    async getPayPeriod(tenantId, id) {
        const payPeriod = await this.prisma.payPeriod.findFirst({
            where: { id, tenantId },
            include: {
                timeEntries: {
                    include: {
                        employee: {
                            include: { user: true },
                        },
                    },
                },
            },
        });
        if (!payPeriod) {
            throw new common_1.NotFoundException('Pay period not found');
        }
        return payPeriod;
    }
    async approveTimesheet(tenantId, userId, timeEntryId, data) {
        const timeEntry = await this.prisma.timeEntry.findFirst({
            where: { id: timeEntryId },
            include: { payPeriod: true },
        });
        if (!timeEntry) {
            throw new common_1.NotFoundException('Time entry not found');
        }
        if (timeEntry.payPeriod?.status === 'locked') {
            throw new common_1.ForbiddenException('Cannot modify timesheet in locked pay period');
        }
        const updated = await this.prisma.timeEntry.update({
            where: { id: timeEntryId },
            data: {
                status: data.approved ? 'approved' : 'rejected',
                approvedAt: new Date(),
                approvedBy: userId,
                rejectionReason: data.approved ? null : data.rejectionReason,
            },
        });
        await this.logAudit(tenantId, userId, data.approved ? 'APPROVE_TIMESHEET' : 'REJECT_TIMESHEET', 'TimeEntry', timeEntryId, {
            approved: data.approved,
            rejectionReason: data.rejectionReason,
        });
        return updated;
    }
    async lockPayPeriod(tenantId, userId, id) {
        const payPeriod = await this.prisma.payPeriod.findFirst({
            where: { id, tenantId },
        });
        if (!payPeriod) {
            throw new common_1.NotFoundException('Pay period not found');
        }
        if (payPeriod.status !== 'open') {
            throw new common_1.ForbiddenException('Pay period is not open for locking');
        }
        const unapprovedEntries = await this.prisma.timeEntry.count({
            where: {
                payPeriodId: id,
                status: { in: ['draft', 'submitted', 'rejected'] },
            },
        });
        if (unapprovedEntries > 0) {
            throw new common_1.ForbiddenException('All timesheets must be approved before locking');
        }
        const updated = await this.prisma.payPeriod.update({
            where: { id },
            data: {
                status: 'locked',
                lockedAt: new Date(),
                lockedBy: userId,
            },
        });
        await this.logAudit(tenantId, userId, 'LOCK_PAY_PERIOD', 'PayPeriod', id, {
            lockedAt: new Date(),
        });
        return updated;
    }
    async calculatePayroll(tenantId, userId, payPeriodId) {
        const payPeriod = await this.prisma.payPeriod.findFirst({
            where: { id: payPeriodId, tenantId },
        });
        if (!payPeriod) {
            throw new common_1.NotFoundException('Pay period not found');
        }
        if (payPeriod.status !== 'locked') {
            throw new common_1.ForbiddenException('Pay period must be locked before calculation');
        }
        const timeEntries = await this.prisma.timeEntry.findMany({
            where: { payPeriodId, status: 'approved' },
            include: { employee: true },
        });
        const employeeHoursMap = new Map();
        for (const entry of timeEntries) {
            const existing = employeeHoursMap.get(entry.employeeId) || {
                employeeId: entry.employeeId,
                totalMinutes: 0,
                breakMinutes: 0,
            };
            existing.totalMinutes += entry.totalMinutes || 0;
            existing.breakMinutes += entry.breakMinutes;
            employeeHoursMap.set(entry.employeeId, existing);
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        const settings = JSON.parse(tenant?.settings || '{}');
        const overtimeThreshold = settings.overtimeThreshold || 480;
        const overtimeMultiplier = settings.overtimeMultiplier || 1.5;
        const defaultPayRate = settings.defaultPayRate || 15;
        const records = [];
        for (const [, hours] of employeeHoursMap) {
            const totalMinutes = hours.totalMinutes - hours.breakMinutes;
            const totalHours = totalMinutes / 60;
            const regularMinutes = Math.min(totalMinutes, overtimeThreshold);
            const overtimeMinutes = Math.max(0, totalMinutes - overtimeThreshold);
            const regularHours = regularMinutes / 60;
            const overtimeHours = overtimeMinutes / 60;
            const payRate = defaultPayRate;
            const regularPay = regularHours * payRate;
            const overtimePay = overtimeHours * payRate * overtimeMultiplier;
            const grossPay = regularPay + overtimePay;
            const record = await this.prisma.payrollRecord.upsert({
                where: {
                    payPeriodId_employeeId: {
                        payPeriodId,
                        employeeId: hours.employeeId,
                    },
                },
                update: {
                    totalHours,
                    breakDeductions: hours.breakMinutes / 60,
                    overtimeHours,
                    overtimePay,
                    regularPay,
                    grossPay,
                    payRate,
                    calculatedAt: new Date(),
                },
                create: {
                    payPeriodId,
                    employeeId: hours.employeeId,
                    totalHours,
                    breakDeductions: hours.breakMinutes / 60,
                    overtimeHours,
                    overtimePay,
                    regularPay,
                    grossPay,
                    payRate,
                },
            });
            records.push(record);
        }
        await this.prisma.payPeriod.update({
            where: { id: payPeriodId },
            data: { status: 'calculated', calculatedAt: new Date() },
        });
        await this.logAudit(tenantId, userId, 'CALCULATE_PAYROLL', 'PayPeriod', payPeriodId, {
            recordsCount: records.length,
        });
        return { payPeriodId, records };
    }
    async exportPayroll(tenantId, userId, payPeriodId, provider, format) {
        const payPeriod = await this.prisma.payPeriod.findFirst({
            where: { id: payPeriodId, tenantId },
        });
        if (!payPeriod) {
            throw new common_1.NotFoundException('Pay period not found');
        }
        if (payPeriod.status !== 'calculated') {
            throw new common_1.ForbiddenException('Payroll must be calculated before export');
        }
        const records = await this.prisma.payrollRecord.findMany({
            where: { payPeriodId },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        const exportData = records.map(r => ({
            employeeId: r.employeeId,
            employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
            employeeNumber: r.employee.employeeNumber,
            totalHours: r.totalHours,
            breakDeductions: r.breakDeductions,
            overtimeHours: r.overtimeHours,
            overtimePay: r.overtimePay,
            regularPay: r.regularPay,
            grossPay: r.grossPay,
            payRate: r.payRate,
        }));
        await this.prisma.payPeriod.update({
            where: { id: payPeriodId },
            data: {
                status: 'exported',
                exportedAt: new Date(),
                exportProvider: provider,
            },
        });
        await this.logAudit(tenantId, userId, 'EXPORT_PAYROLL', 'PayPeriod', payPeriodId, {
            provider,
            format,
            payPeriodReference: payPeriod.name,
            exportDate: new Date(),
            recordsCount: records.length,
        });
        return {
            payPeriodReference: payPeriod.name,
            exportDate: new Date(),
            provider,
            format,
            data: exportData,
        };
    }
    async getAuditLogs(tenantId, entityType, entityId) {
        const where = { tenantId };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map