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
exports.TimeOffService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let TimeOffService = class TimeOffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getClientIp(request) {
        return request?.ip || request?.connection?.remoteAddress || request?.headers?.['x-forwarded-for'] || 'unknown';
    }
    calculateBusinessDays(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    }
    async createLog(timeOffRequestId, balanceId, employeeId, tenantId, action, performedBy, request, previousValues, newValues, reason) {
        await this.prisma.timeOffLog.create({
            data: {
                timeOffRequestId,
                balanceId,
                employeeId,
                tenantId,
                action,
                performedBy,
                previousValues,
                newValues,
                reason,
                ipAddress: this.getClientIp(request),
                userAgent: request?.headers?.['user-agent'],
            },
        });
    }
    async createAuditLog(tenantId, userId, action, entityType, entityId, metadata) {
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType,
                entityId,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            },
        });
    }
    async createRequest(userId, tenantId, dto, request) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found');
        }
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        if (startDate < new Date()) {
            throw new common_1.BadRequestException('Cannot create request for past dates');
        }
        const conflictingRequest = await this.prisma.timeOffRequest.findFirst({
            where: {
                employeeId: employee.id,
                status: { in: ['pending', 'approved'] },
                OR: [
                    {
                        AND: [
                            { startDate: { lte: startDate } },
                            { endDate: { gte: startDate } },
                        ],
                    },
                    {
                        AND: [
                            { startDate: { lte: endDate } },
                            { endDate: { gte: endDate } },
                        ],
                    },
                    {
                        AND: [
                            { startDate: { gte: startDate } },
                            { endDate: { lte: endDate } },
                        ],
                    },
                ],
            },
        });
        if (conflictingRequest) {
            throw new common_1.BadRequestException('You already have a time-off request for this period');
        }
        const isHolidayWork = await this.checkHolidayOverlap(tenantId, startDate, endDate, employee.departmentId ?? undefined, employee.locationId ?? undefined);
        const totalDays = this.calculateBusinessDays(startDate, endDate);
        if (dto.type !== 'unpaid' && dto.type !== 'other') {
            const balance = await this.getOrCreateBalance(employee.id, tenantId, dto.type, startDate.getFullYear());
            const availableDays = balance.totalDays + balance.carryOverDays - balance.usedDays - balance.pendingDays;
            if (totalDays > availableDays) {
                throw new common_1.BadRequestException(`Insufficient balance. Available: ${availableDays} days, Requested: ${totalDays} days`);
            }
            await this.prisma.timeOffBalance.update({
                where: { id: balance.id },
                data: { pendingDays: balance.pendingDays + totalDays },
            });
        }
        const timeOffRequest = await this.prisma.timeOffRequest.create({
            data: {
                employeeId: employee.id,
                tenantId,
                type: dto.type,
                startDate,
                endDate,
                totalDays,
                reason: dto.reason,
                status: 'pending',
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        await this.createLog(timeOffRequest.id, null, employee.id, tenantId, 'CREATE_REQUEST', userId, request);
        await this.createAuditLog(tenantId, userId, 'CREATE_TIME_OFF_REQUEST', 'TimeOffRequest', timeOffRequest.id, {
            type: dto.type,
            totalDays,
            startDate: dto.startDate,
            endDate: dto.endDate,
        });
        return timeOffRequest;
    }
    async getMyRequests(userId, tenantId, query) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return [];
        }
        const where = { employeeId: employee.id };
        if (query.startDate && query.endDate) {
            where.startDate = { gte: new Date(query.startDate) };
            where.endDate = { lte: new Date(query.endDate) };
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.status) {
            where.status = query.status;
        }
        return this.prisma.timeOffRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: query.limit || 50,
            skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
        });
    }
    async getMyBalances(userId, tenantId) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return [];
        }
        const currentYear = new Date().getFullYear();
        return this.prisma.timeOffBalance.findMany({
            where: { employeeId: employee.id, year: currentYear },
        });
    }
    async reviewRequest(tenantId, requestId, dto, userId, request) {
        const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
            where: { id: requestId, tenantId },
            include: { employee: true },
        });
        if (!timeOffRequest) {
            throw new common_1.NotFoundException('Time-off request not found');
        }
        if (timeOffRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending requests can be reviewed');
        }
        if (dto.status === 'approved') {
            if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
                const balance = await this.prisma.timeOffBalance.findFirst({
                    where: {
                        employeeId: timeOffRequest.employeeId,
                        type: timeOffRequest.type,
                        year: timeOffRequest.startDate.getFullYear(),
                    },
                });
                if (balance) {
                    await this.prisma.timeOffBalance.update({
                        where: { id: balance.id },
                        data: {
                            usedDays: balance.usedDays + timeOffRequest.totalDays,
                            pendingDays: balance.pendingDays - timeOffRequest.totalDays,
                        },
                    });
                }
            }
        }
        else if (dto.status === 'rejected') {
            if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
                const balance = await this.prisma.timeOffBalance.findFirst({
                    where: {
                        employeeId: timeOffRequest.employeeId,
                        type: timeOffRequest.type,
                        year: timeOffRequest.startDate.getFullYear(),
                    },
                });
                if (balance) {
                    await this.prisma.timeOffBalance.update({
                        where: { id: balance.id },
                        data: {
                            pendingDays: Math.max(0, balance.pendingDays - timeOffRequest.totalDays),
                        },
                    });
                }
            }
        }
        const updated = await this.prisma.timeOffRequest.update({
            where: { id: requestId },
            data: {
                status: dto.status,
                reviewedBy: userId,
                reviewedAt: new Date(),
                reviewComment: dto.comment,
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        await this.createLog(requestId, null, timeOffRequest.employeeId, tenantId, `REVIEW_${dto.status.toUpperCase()}`, userId, request, JSON.stringify({ previousStatus: 'pending' }), JSON.stringify({ newStatus: dto.status, comment: dto.comment }));
        await this.createAuditLog(tenantId, userId, `TIME_OFF_${dto.status.toUpperCase()}`, 'TimeOffRequest', requestId, {
            reviewedBy: userId,
            comment: dto.comment,
        });
        return updated;
    }
    async cancelMyRequest(userId, tenantId, requestId, dto, request) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found');
        }
        const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
            where: { id: requestId, employeeId: employee.id },
        });
        if (!timeOffRequest) {
            throw new common_1.NotFoundException('Time-off request not found');
        }
        if (timeOffRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending requests can be canceled');
        }
        if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
            const balance = await this.prisma.timeOffBalance.findFirst({
                where: {
                    employeeId: employee.id,
                    type: timeOffRequest.type,
                    year: timeOffRequest.startDate.getFullYear(),
                },
            });
            if (balance) {
                await this.prisma.timeOffBalance.update({
                    where: { id: balance.id },
                    data: {
                        pendingDays: Math.max(0, balance.pendingDays - timeOffRequest.totalDays),
                    },
                });
            }
        }
        const updated = await this.prisma.timeOffRequest.update({
            where: { id: requestId },
            data: {
                status: 'canceled',
            },
        });
        await this.createLog(requestId, null, employee.id, tenantId, 'CANCEL_REQUEST', userId, request, JSON.stringify({ previousStatus: 'pending' }), JSON.stringify({ newStatus: 'canceled', reason: dto.reason }));
        await this.createAuditLog(tenantId, userId, 'TIME_OFF_CANCELED', 'TimeOffRequest', requestId);
        return updated;
    }
    async getAdminRequests(tenantId, query) {
        const where = { tenantId };
        if (query.startDate && query.endDate) {
            where.startDate = { gte: new Date(query.startDate) };
            where.endDate = { lte: new Date(query.endDate) };
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.employeeId) {
            where.employeeId = query.employeeId;
        }
        const [requests, total] = await Promise.all([
            this.prisma.timeOffRequest.findMany({
                where,
                include: {
                    employee: {
                        include: {
                            user: true,
                            department: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: query.limit || 50,
                skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
            }),
            this.prisma.timeOffRequest.count({ where }),
        ]);
        return {
            data: requests,
            total,
            page: query.page || 1,
            limit: query.limit || 50,
            totalPages: Math.ceil(total / (query.limit || 50)),
        };
    }
    async getLeaveCalendar(tenantId, query) {
        const where = {
            tenantId,
            status: 'approved',
        };
        if (query.startDate && query.endDate) {
            where.startDate = { gte: new Date(query.startDate) };
            where.endDate = { lte: new Date(query.endDate) };
        }
        const requests = await this.prisma.timeOffRequest.findMany({
            where,
            include: {
                employee: {
                    include: { user: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });
        return requests.map((r) => ({
            id: r.id,
            employeeId: r.employeeId,
            employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
            type: r.type,
            startDate: r.startDate,
            endDate: r.endDate,
            totalDays: r.totalDays,
        }));
    }
    async getEmployeeBalances(tenantId, employeeId) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const currentYear = new Date().getFullYear();
        return this.prisma.timeOffBalance.findMany({
            where: { employeeId, year: currentYear },
        });
    }
    async createOrUpdateBalance(tenantId, employeeId, dto, userId, request) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const existing = await this.prisma.timeOffBalance.findFirst({
            where: { employeeId, type: dto.type, year: dto.year },
        });
        let balance;
        if (existing) {
            balance = await this.prisma.timeOffBalance.update({
                where: { id: existing.id },
                data: {
                    totalDays: dto.totalDays,
                    carryOverDays: dto.carryOverDays || 0,
                },
            });
        }
        else {
            balance = await this.prisma.timeOffBalance.create({
                data: {
                    employeeId,
                    tenantId,
                    type: dto.type,
                    year: dto.year,
                    totalDays: dto.totalDays,
                    carryOverDays: dto.carryOverDays || 0,
                    usedDays: 0,
                    pendingDays: 0,
                },
            });
        }
        await this.createLog(null, balance.id, employeeId, tenantId, existing ? 'UPDATE_BALANCE' : 'CREATE_BALANCE', userId, request);
        await this.createAuditLog(tenantId, userId, 'SET_BALANCE', 'TimeOffBalance', balance.id, {
            type: dto.type,
            year: dto.year,
            totalDays: dto.totalDays,
        });
        return balance;
    }
    async adjustBalance(tenantId, balanceId, dto, userId, request) {
        const balance = await this.prisma.timeOffBalance.findFirst({
            where: { id: balanceId, tenantId },
        });
        if (!balance) {
            throw new common_1.NotFoundException('Balance record not found');
        }
        if (!dto.reason || dto.reason.trim().length < 5) {
            throw new common_1.BadRequestException('Reason is required for balance adjustment');
        }
        const previousValues = JSON.stringify({
            totalDays: balance.totalDays,
            usedDays: balance.usedDays,
            carryOverDays: balance.carryOverDays,
        });
        const updated = await this.prisma.timeOffBalance.update({
            where: { id: balanceId },
            data: {
                totalDays: dto.totalDays,
                usedDays: dto.usedDays !== undefined ? dto.usedDays : balance.usedDays,
                carryOverDays: dto.carryOverDays !== undefined ? dto.carryOverDays : balance.carryOverDays,
            },
        });
        await this.createLog(null, balanceId, balance.employeeId, tenantId, 'ADJUST_BALANCE', userId, request, previousValues, JSON.stringify({
            totalDays: dto.totalDays,
            usedDays: dto.usedDays,
            carryOverDays: dto.carryOverDays,
        }), dto.reason);
        await this.createAuditLog(tenantId, userId, 'ADJUST_BALANCE', 'TimeOffBalance', balanceId, {
            previousValues,
            newValues: { totalDays: dto.totalDays, usedDays: dto.usedDays, carryOverDays: dto.carryOverDays },
            reason: dto.reason,
        });
        return updated;
    }
    async getRequestLogs(tenantId, requestId) {
        const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
            where: { id: requestId, tenantId },
        });
        if (!timeOffRequest) {
            throw new common_1.NotFoundException('Time-off request not found');
        }
        return this.prisma.timeOffLog.findMany({
            where: { timeOffRequestId: requestId },
            orderBy: { performedAt: 'desc' },
        });
    }
    async getBalanceHistory(tenantId, balanceId) {
        const balance = await this.prisma.timeOffBalance.findFirst({
            where: { id: balanceId, tenantId },
        });
        if (!balance) {
            throw new common_1.NotFoundException('Balance record not found');
        }
        return this.prisma.timeOffLog.findMany({
            where: { balanceId },
            orderBy: { performedAt: 'desc' },
        });
    }
    async getAdminStats(tenantId, query) {
        const where = { tenantId };
        if (query.startDate && query.endDate) {
            where.createdAt = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        const [pending, approved, rejected, canceled, byType] = await Promise.all([
            this.prisma.timeOffRequest.count({ where: { ...where, status: 'pending' } }),
            this.prisma.timeOffRequest.count({ where: { ...where, status: 'approved' } }),
            this.prisma.timeOffRequest.count({ where: { ...where, status: 'rejected' } }),
            this.prisma.timeOffRequest.count({ where: { ...where, status: 'canceled' } }),
            this.prisma.timeOffRequest.groupBy({
                by: ['type'],
                where,
                _count: true,
            }),
        ]);
        return {
            pending,
            approved,
            rejected,
            canceled,
            total: pending + approved + rejected + canceled,
            byType: byType.map((t) => ({
                type: t.type,
                count: t._count,
            })),
        };
    }
    async getOrCreateBalance(employeeId, tenantId, type, year) {
        let balance = await this.prisma.timeOffBalance.findFirst({
            where: { employeeId, type, year },
        });
        if (!balance) {
            const defaultDays = type === 'annual' ? 15 : type === 'sick' ? 10 : 0;
            balance = await this.prisma.timeOffBalance.create({
                data: {
                    employeeId,
                    tenantId,
                    type,
                    year,
                    totalDays: defaultDays,
                    usedDays: 0,
                    pendingDays: 0,
                    carryOverDays: 0,
                },
            });
        }
        return balance;
    }
    async checkHolidayOverlap(tenantId, startDate, endDate, departmentId, locationId) {
        const holidays = await this.prisma.holiday.findMany({
            where: {
                tenantId,
                isActive: true,
                OR: [
                    {
                        AND: [
                            { date: { lte: endDate } },
                            { OR: [{ endDate: { gte: startDate } }, { endDate: null }] },
                        ],
                    },
                ],
            },
        });
        return holidays.length > 0;
    }
    async getAllEmployees(tenantId) {
        return this.prisma.employee.findMany({
            where: { tenantId, onboardingStatus: 'employee_active' },
            include: { user: true, department: true },
            orderBy: { user: { lastName: 'asc' } },
        });
    }
};
exports.TimeOffService = TimeOffService;
exports.TimeOffService = TimeOffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], TimeOffService);
//# sourceMappingURL=time-off.service.js.map