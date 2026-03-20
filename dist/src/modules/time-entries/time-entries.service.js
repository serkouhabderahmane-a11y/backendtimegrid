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
exports.TimeEntriesService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let TimeEntriesService = class TimeEntriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOpenPayPeriod(tenantId) {
        return this.prisma.payPeriod.findFirst({
            where: { tenantId, status: 'open' },
            orderBy: { startDate: 'desc' },
        });
    }
    async clockIn(userId, tenantId) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            throw new common_1.ForbiddenException('Employee record not found');
        }
        if (!employee.canClockIn) {
            throw new common_1.ForbiddenException('Cannot clock in. Complete onboarding first.');
        }
        if (employee.onboardingStatus !== 'employee_active') {
            throw new common_1.ForbiddenException('Onboarding must be completed before clocking in.');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const existingEntry = await this.prisma.timeEntry.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: {
                    gte: today,
                    lt: tomorrow,
                },
                clockOut: null,
            },
        });
        if (existingEntry) {
            throw new common_1.ForbiddenException('Already clocked in today');
        }
        const openPayPeriod = await this.getOpenPayPeriod(tenantId);
        const timeEntry = await this.prisma.timeEntry.create({
            data: {
                employeeId: employee.id,
                clockIn: new Date(),
                payPeriodId: openPayPeriod?.id,
                status: openPayPeriod ? 'submitted' : 'draft',
            },
        });
        return timeEntry;
    }
    async clockOut(userId, tenantId) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            throw new common_1.ForbiddenException('Employee record not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const timeEntry = await this.prisma.timeEntry.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: {
                    gte: today,
                    lt: tomorrow,
                },
                clockOut: null,
            },
        });
        if (!timeEntry) {
            throw new common_1.ForbiddenException('No active clock-in found');
        }
        const clockOut = new Date();
        const totalMinutes = Math.floor((clockOut.getTime() - timeEntry.clockIn.getTime()) / 60000);
        const updated = await this.prisma.timeEntry.update({
            where: { id: timeEntry.id },
            data: {
                clockOut,
                totalMinutes,
            },
        });
        return updated;
    }
    async getTodayEntry(userId, tenantId) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return null;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prisma.timeEntry.findFirst({
            where: {
                employeeId: employee.id,
                clockIn: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
    }
    async getEntries(userId, tenantId, startDate, endDate) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return [];
        }
        const where = { employeeId: employee.id };
        if (startDate && endDate) {
            where.clockIn = {
                gte: startDate,
                lte: endDate,
            };
        }
        return this.prisma.timeEntry.findMany({
            where,
            orderBy: { clockIn: 'desc' },
        });
    }
    async getAllTimesheets(tenantId, payPeriodId) {
        const where = { tenantId };
        if (payPeriodId) {
            where.payPeriodId = payPeriodId;
        }
        const employees = await this.prisma.employee.findMany({
            where: { tenantId },
            include: { user: true },
        });
        const employeeMap = new Map(employees.map(e => [e.id, e]));
        const timesheets = await this.prisma.timeEntry.findMany({
            where,
            include: { employee: { include: { user: true } } },
            orderBy: { clockIn: 'desc' },
        });
        return timesheets;
    }
    async assignToPayPeriod(tenantId, timesheetId, payPeriodId) {
        const timesheet = await this.prisma.timeEntry.findFirst({
            where: { id: timesheetId },
        });
        if (!timesheet) {
            throw new common_1.NotFoundException('Timesheet not found');
        }
        const payPeriod = await this.prisma.payPeriod.findFirst({
            where: { id: payPeriodId, tenantId },
        });
        if (!payPeriod) {
            throw new common_1.NotFoundException('Pay period not found');
        }
        if (payPeriod.status !== 'open') {
            throw new common_1.ForbiddenException('Cannot assign timesheet to locked pay period');
        }
        return this.prisma.timeEntry.update({
            where: { id: timesheetId },
            data: {
                payPeriodId,
                status: 'submitted',
            },
        });
    }
    async approveTimesheet(tenantId, timesheetId, userId) {
        const timesheet = await this.prisma.timeEntry.findFirst({
            where: { id: timesheetId },
            include: { employee: true },
        });
        if (!timesheet || timesheet.employee.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Timesheet not found');
        }
        if (timesheet.status !== 'submitted') {
            throw new common_1.BadRequestException('Only submitted timesheets can be approved');
        }
        const updated = await this.prisma.timeEntry.update({
            where: { id: timesheetId },
            data: {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: userId,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'APPROVE_TIMESHEET',
                entityType: 'TimeEntry',
                entityId: timesheetId,
            },
        });
        return updated;
    }
    async rejectTimesheet(tenantId, timesheetId, userId, reason) {
        const timesheet = await this.prisma.timeEntry.findFirst({
            where: { id: timesheetId },
            include: { employee: true },
        });
        if (!timesheet || timesheet.employee.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Timesheet not found');
        }
        if (timesheet.status !== 'submitted') {
            throw new common_1.BadRequestException('Only submitted timesheets can be rejected');
        }
        const updated = await this.prisma.timeEntry.update({
            where: { id: timesheetId },
            data: {
                status: 'rejected',
                rejectionReason: reason,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'REJECT_TIMESHEET',
                entityType: 'TimeEntry',
                entityId: timesheetId,
                metadata: JSON.stringify({ reason }),
            },
        });
        return updated;
    }
    async reviewTimesheet(tenantId, timesheetId, userId) {
        const timesheet = await this.prisma.timeEntry.findFirst({
            where: { id: timesheetId },
            include: { employee: true },
        });
        if (!timesheet || timesheet.employee.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Timesheet not found');
        }
        if (timesheet.status !== 'approved') {
            throw new common_1.BadRequestException('Only approved timesheets can be reviewed by HR');
        }
        return {
            ...timesheet,
            hrReviewed: true,
            hrReviewedAt: new Date(),
        };
    }
    async getTimesheetsForPayPeriod(tenantId, payPeriodId) {
        const timesheets = await this.prisma.timeEntry.findMany({
            where: {
                payPeriodId,
                employee: {
                    tenantId,
                },
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { clockIn: 'asc' },
        });
        return timesheets;
    }
};
exports.TimeEntriesService = TimeEntriesService;
exports.TimeEntriesService = TimeEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], TimeEntriesService);
//# sourceMappingURL=time-entries.service.js.map