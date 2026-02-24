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
        const timeEntry = await this.prisma.timeEntry.create({
            data: {
                employeeId: employee.id,
                clockIn: new Date(),
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
};
exports.TimeEntriesService = TimeEntriesService;
exports.TimeEntriesService = TimeEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], TimeEntriesService);
//# sourceMappingURL=time-entries.service.js.map