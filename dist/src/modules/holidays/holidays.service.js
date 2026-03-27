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
exports.HolidaysService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let HolidaysService = class HolidaysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async createHoliday(tenantId, dto, userId) {
        const existingHoliday = await this.prisma.holiday.findFirst({
            where: {
                tenantId,
                date: new Date(dto.date),
                isActive: true,
            },
        });
        if (existingHoliday) {
            throw new common_1.BadRequestException('A holiday already exists on this date');
        }
        if (dto.endDate && new Date(dto.endDate) < new Date(dto.date)) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const holiday = await this.prisma.holiday.create({
            data: {
                tenantId,
                name: dto.name,
                date: new Date(dto.date),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                type: dto.type,
                description: dto.description,
                isRecurring: dto.isRecurring || false,
                isActive: true,
            },
        });
        await this.createAuditLog(tenantId, userId, 'CREATE_HOLIDAY', 'Holiday', holiday.id, {
            name: dto.name,
            date: dto.date,
            type: dto.type,
        });
        return holiday;
    }
    async updateHoliday(tenantId, holidayId, dto, userId) {
        const holiday = await this.prisma.holiday.findFirst({
            where: { id: holidayId, tenantId },
        });
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found');
        }
        if (dto.date) {
            const existingHoliday = await this.prisma.holiday.findFirst({
                where: {
                    tenantId,
                    date: new Date(dto.date),
                    isActive: true,
                    id: { not: holidayId },
                },
            });
            if (existingHoliday) {
                throw new common_1.BadRequestException('A holiday already exists on this date');
            }
        }
        if (dto.endDate && dto.date && new Date(dto.endDate) < new Date(dto.date)) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const updated = await this.prisma.holiday.update({
            where: { id: holidayId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
        await this.createAuditLog(tenantId, userId, 'UPDATE_HOLIDAY', 'Holiday', holidayId, {
            changes: Object.keys(dto),
        });
        return updated;
    }
    async disableHoliday(tenantId, holidayId, userId) {
        const holiday = await this.prisma.holiday.findFirst({
            where: { id: holidayId, tenantId },
        });
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found');
        }
        const updated = await this.prisma.holiday.update({
            where: { id: holidayId },
            data: { isActive: false },
        });
        await this.createAuditLog(tenantId, userId, 'DISABLE_HOLIDAY', 'Holiday', holidayId);
        return updated;
    }
    async getHoliday(tenantId, holidayId) {
        const holiday = await this.prisma.holiday.findFirst({
            where: { id: holidayId, tenantId },
            include: {
                assignments: {
                    include: {
                        department: true,
                        location: true,
                    },
                },
            },
        });
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found');
        }
        return holiday;
    }
    async getHolidays(tenantId, query) {
        const where = { tenantId };
        if (query.startDate && query.endDate) {
            where.date = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        else if (query.startDate) {
            where.date = { gte: new Date(query.startDate) };
        }
        else if (query.endDate) {
            where.date = { lte: new Date(query.endDate) };
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        const [holidays, total] = await Promise.all([
            this.prisma.holiday.findMany({
                where,
                include: {
                    assignments: {
                        include: {
                            department: true,
                            location: true,
                        },
                    },
                },
                orderBy: { date: 'asc' },
                take: query.limit || 50,
                skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
            }),
            this.prisma.holiday.count({ where }),
        ]);
        return {
            data: holidays,
            total,
            page: query.page || 1,
            limit: query.limit || 50,
            totalPages: Math.ceil(total / (query.limit || 50)),
        };
    }
    async assignHoliday(tenantId, holidayId, dto, userId) {
        const holiday = await this.prisma.holiday.findFirst({
            where: { id: holidayId, tenantId },
        });
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found');
        }
        if (!dto.departmentId && !dto.locationId && !dto.region) {
            throw new common_1.BadRequestException('At least one assignment criteria is required');
        }
        if (dto.departmentId) {
            const department = await this.prisma.department.findFirst({
                where: { id: dto.departmentId, tenantId },
            });
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
        }
        if (dto.locationId) {
            const location = await this.prisma.location.findFirst({
                where: { id: dto.locationId, tenantId },
            });
            if (!location) {
                throw new common_1.NotFoundException('Location not found');
            }
        }
        const existing = await this.prisma.holidayAssignment.findFirst({
            where: {
                holidayId,
                ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
                ...(dto.locationId ? { locationId: dto.locationId } : {}),
                ...(dto.region ? { region: dto.region } : {}),
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Assignment already exists');
        }
        const assignment = await this.prisma.holidayAssignment.create({
            data: {
                holidayId,
                departmentId: dto.departmentId,
                locationId: dto.locationId,
                region: dto.region,
            },
            include: {
                holiday: true,
                department: true,
                location: true,
            },
        });
        await this.createAuditLog(tenantId, userId, 'ASSIGN_HOLIDAY', 'HolidayAssignment', assignment.id, {
            holidayId,
            ...dto,
        });
        return assignment;
    }
    async removeAssignment(tenantId, assignmentId, userId) {
        const assignment = await this.prisma.holidayAssignment.findFirst({
            where: { id: assignmentId },
            include: { holiday: true },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (assignment.holiday.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Access denied');
        }
        await this.prisma.holidayAssignment.delete({
            where: { id: assignmentId },
        });
        await this.createAuditLog(tenantId, userId, 'REMOVE_HOLIDAY_ASSIGNMENT', 'HolidayAssignment', assignmentId);
        return { success: true };
    }
    async getHolidayAssignments(tenantId, holidayId) {
        const holiday = await this.prisma.holiday.findFirst({
            where: { id: holidayId, tenantId },
        });
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found');
        }
        return this.prisma.holidayAssignment.findMany({
            where: { holidayId },
            include: {
                department: true,
                location: true,
            },
        });
    }
    async getUpcomingHolidays(tenantId, departmentId, locationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const holidays = await this.prisma.holiday.findMany({
            where: {
                tenantId,
                isActive: true,
                date: { gte: today },
            },
            include: {
                assignments: {
                    where: {
                        OR: [
                            { departmentId: departmentId || null },
                            { locationId: locationId || null },
                            { departmentId: null, locationId: null },
                        ],
                    },
                },
            },
            orderBy: { date: 'asc' },
            take: 10,
        });
        return holidays.filter((h) => {
            if (h.assignments.length === 0) {
                return true;
            }
            return h.assignments.some((a) => (departmentId && a.departmentId === departmentId) ||
                (locationId && a.locationId === locationId) ||
                (!a.departmentId && !a.locationId));
        });
    }
    async getAllDepartments(tenantId) {
        return this.prisma.department.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getAllLocations(tenantId) {
        return this.prisma.location.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async checkDateIsHoliday(tenantId, date, departmentId, locationId) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const holiday = await this.prisma.holiday.findFirst({
            where: {
                tenantId,
                isActive: true,
                OR: [
                    {
                        AND: [
                            { date: { lte: startOfDay } },
                            { OR: [{ endDate: { gte: endOfDay } }, { endDate: null }] },
                        ],
                    },
                    {
                        AND: [
                            { date: { gte: startOfDay } },
                            { date: { lte: endOfDay } },
                        ],
                    },
                ],
            },
            include: {
                assignments: {
                    where: {
                        OR: [
                            { departmentId: departmentId || undefined },
                            { locationId: locationId || undefined },
                            { AND: [{ departmentId: null }, { locationId: null }] },
                        ],
                    },
                },
            },
        });
        if (!holiday) {
            return false;
        }
        if (holiday.assignments.length === 0) {
            return true;
        }
        return holiday.assignments.some((a) => (departmentId && a.departmentId === departmentId) ||
            (locationId && a.locationId === locationId) ||
            (!a.departmentId && !a.locationId));
    }
};
exports.HolidaysService = HolidaysService;
exports.HolidaysService = HolidaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], HolidaysService);
//# sourceMappingURL=holidays.service.js.map