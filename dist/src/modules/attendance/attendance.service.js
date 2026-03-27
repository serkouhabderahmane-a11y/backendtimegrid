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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getClientIp(request) {
        return request?.ip || request?.connection?.remoteAddress || request?.headers?.['x-forwarded-for'] || 'unknown';
    }
    getWorkDate(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    isHoliday(tenantId, date, departmentId, locationId) {
        return false;
    }
    async checkOverlappingTimeOff(employeeId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const timeOff = await this.prisma.timeOffRequest.findFirst({
            where: {
                employeeId,
                status: 'approved',
                OR: [
                    {
                        startDate: { lte: endOfDay },
                        endDate: { gte: startOfDay },
                    },
                ],
            },
        });
        return !!timeOff;
    }
    async logAttendance(attendanceId, action, performedBy, request, details) {
        await this.prisma.attendanceLog.create({
            data: {
                attendanceId,
                action,
                performedBy,
                ipAddress: this.getClientIp(request),
                userAgent: request?.headers?.['user-agent'],
                details,
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
    async clockIn(userId, tenantId, dto, request) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
            include: { user: true, department: true, location: true },
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
        const now = new Date();
        const workDate = this.getWorkDate(now);
        const existingActiveClockIn = await this.prisma.attendanceRecord.findFirst({
            where: {
                employeeId: employee.id,
                workDate,
                status: 'active',
                clockOut: null,
            },
        });
        if (existingActiveClockIn) {
            throw new common_1.BadRequestException('Already clocked in today. Please clock out first.');
        }
        const hasApprovedTimeOff = await this.checkOverlappingTimeOff(employee.id, now);
        if (hasApprovedTimeOff) {
            throw new common_1.BadRequestException('Cannot clock in. You have an approved time-off on this day.');
        }
        const isHoliday = await this.checkIsHoliday(tenantId, now, employee.departmentId ?? undefined, employee.locationId ?? undefined);
        const SCHEDULED_START_HOUR = 9;
        const isLate = now.getHours() > SCHEDULED_START_HOUR;
        const attendance = await this.prisma.attendanceRecord.create({
            data: {
                employeeId: employee.id,
                tenantId,
                clockIn: now,
                workDate,
                deviceType: dto.deviceType,
                ipAddress: this.getClientIp(request),
                latitude: dto.latitude,
                longitude: dto.longitude,
                isLate,
                isHolidayWork: isHoliday,
                status: 'active',
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        await this.logAttendance(attendance.id, 'CLOCK_IN', userId, request, `Employee ${employee.user.firstName} ${employee.user.lastName} clocked in`);
        await this.createAuditLog(tenantId, userId, 'CLOCK_IN', 'AttendanceRecord', attendance.id);
        return {
            id: attendance.id,
            clockIn: attendance.clockIn,
            workDate: attendance.workDate,
            isLate: attendance.isLate,
            isHolidayWork: attendance.isHolidayWork,
            status: attendance.status,
            employee: {
                id: employee.id,
                name: `${employee.user.firstName} ${employee.user.lastName}`,
            },
        };
    }
    async clockOut(userId, tenantId, dto, request) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
            include: { user: true },
        });
        if (!employee) {
            throw new common_1.ForbiddenException('Employee record not found');
        }
        const workDate = this.getWorkDate();
        const activeClockIn = await this.prisma.attendanceRecord.findFirst({
            where: {
                employeeId: employee.id,
                workDate,
                status: 'active',
                clockOut: null,
            },
        });
        if (!activeClockIn) {
            throw new common_1.BadRequestException('No active clock-in found. Please clock in first.');
        }
        const now = new Date();
        const totalMinutes = Math.floor((now.getTime() - activeClockIn.clockIn.getTime()) / 60000) - activeClockIn.breakMinutes;
        const SCHEDULED_END_HOUR = 17;
        const isEarlyLeave = now.getHours() < SCHEDULED_END_HOUR && totalMinutes < (SCHEDULED_END_HOUR - 9) * 60;
        const MIN_WORK_MINUTES = 30;
        const MAX_WORK_MINUTES = 720;
        const isFlagged = totalMinutes < MIN_WORK_MINUTES || totalMinutes > MAX_WORK_MINUTES;
        const updated = await this.prisma.attendanceRecord.update({
            where: { id: activeClockIn.id },
            data: {
                clockOut: now,
                totalMinutes,
                isEarlyLeave,
                status: isFlagged ? 'flagged' : 'completed',
                notes: dto.notes,
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        await this.logAttendance(activeClockIn.id, isFlagged ? 'CLOCK_OUT_FLAGGED' : 'CLOCK_OUT', userId, request, `Duration: ${totalMinutes} minutes. Flagged: ${isFlagged}`);
        await this.createAuditLog(tenantId, userId, 'CLOCK_OUT', 'AttendanceRecord', activeClockIn.id, { totalMinutes, isFlagged });
        return {
            id: updated.id,
            clockIn: updated.clockIn,
            clockOut: updated.clockOut,
            totalMinutes: updated.totalMinutes,
            isEarlyLeave: updated.isEarlyLeave,
            isFlagged,
            status: updated.status,
            employee: {
                id: employee.id,
                name: `${employee.user.firstName} ${employee.user.lastName}`,
            },
        };
    }
    async getTodayAttendance(userId, tenantId) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return null;
        }
        const workDate = this.getWorkDate();
        return this.prisma.attendanceRecord.findFirst({
            where: {
                employeeId: employee.id,
                workDate,
            },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
    }
    async getMyAttendance(userId, tenantId, dto) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return [];
        }
        const where = { employeeId: employee.id };
        if (dto.startDate && dto.endDate) {
            where.workDate = {
                gte: new Date(dto.startDate),
                lte: new Date(dto.endDate),
            };
        }
        const records = await this.prisma.attendanceRecord.findMany({
            where,
            orderBy: { workDate: 'desc' },
            take: dto.limit || 50,
            skip: dto.page ? (dto.page - 1) * (dto.limit || 50) : 0,
        });
        return records;
    }
    async getMyStats(userId, tenantId, dto) {
        const employee = await this.prisma.employee.findFirst({
            where: { userId, tenantId },
        });
        if (!employee) {
            return null;
        }
        const startDate = dto.startDate ? new Date(dto.startDate) : new Date(new Date().setDate(1));
        const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                employeeId: employee.id,
                workDate: { gte: startDate, lte: endDate },
                status: { in: ['completed', 'active'] },
            },
        });
        const totalMinutes = records.reduce((sum, r) => sum + (r.totalMinutes || 0), 0);
        const lateCount = records.filter((r) => r.isLate).length;
        const earlyLeaveCount = records.filter((r) => r.isEarlyLeave).length;
        const presentDays = records.filter((r) => r.clockIn).length;
        const holidayWorkCount = records.filter((r) => r.isHolidayWork).length;
        return {
            totalMinutes,
            totalHours: Math.round((totalMinutes / 60) * 100) / 100,
            lateCount,
            earlyLeaveCount,
            presentDays,
            holidayWorkCount,
            averageHoursPerDay: presentDays > 0 ? Math.round((totalMinutes / presentDays / 60) * 100) / 100 : 0,
        };
    }
    async getAdminAttendance(tenantId, dto) {
        const where = { tenantId };
        if (dto.startDate && dto.endDate) {
            where.workDate = {
                gte: new Date(dto.startDate),
                lte: new Date(dto.endDate),
            };
        }
        if (dto.employeeId) {
            where.employeeId = dto.employeeId;
        }
        if (dto.departmentId) {
            where.employee = { departmentId: dto.departmentId };
        }
        if (dto.status) {
            where.status = dto.status;
        }
        const records = await this.prisma.attendanceRecord.findMany({
            where,
            include: {
                employee: {
                    include: {
                        user: true,
                        department: true,
                    },
                },
            },
            orderBy: { workDate: 'desc' },
            take: dto.limit || 50,
            skip: dto.page ? (dto.page - 1) * (dto.limit || 50) : 0,
        });
        const total = await this.prisma.attendanceRecord.count({ where });
        return {
            data: records,
            total,
            page: dto.page || 1,
            limit: dto.limit || 50,
            totalPages: Math.ceil(total / (dto.limit || 50)),
        };
    }
    async getEmployeeAttendance(tenantId, employeeId, dto) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
            include: { user: true, department: true },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const where = { employeeId };
        if (dto.startDate && dto.endDate) {
            where.workDate = {
                gte: new Date(dto.startDate),
                lte: new Date(dto.endDate),
            };
        }
        const records = await this.prisma.attendanceRecord.findMany({
            where,
            orderBy: { workDate: 'desc' },
            take: dto.limit || 50,
            skip: dto.page ? (dto.page - 1) * (dto.limit || 50) : 0,
        });
        const total = await this.prisma.attendanceRecord.count({ where });
        return {
            employee: {
                id: employee.id,
                name: `${employee.user.firstName} ${employee.user.lastName}`,
                department: employee.department?.name,
                employeeNumber: employee.employeeNumber,
            },
            data: records,
            total,
            page: dto.page || 1,
            limit: dto.limit || 50,
            totalPages: Math.ceil(total / (dto.limit || 50)),
        };
    }
    async adjustAttendance(tenantId, attendanceId, dto, userId, request) {
        const attendance = await this.prisma.attendanceRecord.findFirst({
            where: { id: attendanceId, tenantId },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        if (!dto.reason || dto.reason.trim().length < 10) {
            throw new common_1.BadRequestException('Adjustment reason is required and must be at least 10 characters');
        }
        const previousValues = JSON.stringify({
            clockIn: attendance.clockIn,
            clockOut: attendance.clockOut,
            totalMinutes: attendance.totalMinutes,
        });
        const updateData = {
            status: 'adjusted',
        };
        if (dto.clockIn) {
            updateData.clockIn = new Date(dto.clockIn);
        }
        if (dto.clockOut) {
            updateData.clockOut = new Date(dto.clockOut);
        }
        if (dto.totalMinutes !== undefined) {
            updateData.totalMinutes = dto.totalMinutes;
        }
        else if (dto.clockIn && dto.clockOut) {
            const totalMinutes = Math.floor((new Date(dto.clockOut).getTime() - new Date(dto.clockIn).getTime()) / 60000);
            updateData.totalMinutes = totalMinutes;
        }
        const newValues = JSON.stringify(updateData);
        const adjusted = await this.prisma.attendanceRecord.update({
            where: { id: attendanceId },
            data: updateData,
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        await this.prisma.attendanceAdjustment.create({
            data: {
                attendanceId,
                adjustedBy: userId,
                clockIn: dto.clockIn ? new Date(dto.clockIn) : null,
                clockOut: dto.clockOut ? new Date(dto.clockOut) : null,
                totalMinutes: dto.totalMinutes,
                reason: dto.reason,
                previousValues,
                newValues,
            },
        });
        await this.logAttendance(attendanceId, 'ADJUSTMENT', userId, request, `Reason: ${dto.reason}`);
        await this.createAuditLog(tenantId, userId, 'ATTENDANCE_ADJUST', 'AttendanceRecord', attendanceId, {
            previousValues,
            newValues,
            reason: dto.reason,
        });
        return adjusted;
    }
    async getAdjustments(tenantId, attendanceId) {
        const attendance = await this.prisma.attendanceRecord.findFirst({
            where: { id: attendanceId, tenantId },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return this.prisma.attendanceAdjustment.findMany({
            where: { attendanceId },
            orderBy: { adjustedAt: 'desc' },
        });
    }
    async getAttendanceLogs(tenantId, attendanceId) {
        const attendance = await this.prisma.attendanceRecord.findFirst({
            where: { id: attendanceId, tenantId },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return this.prisma.attendanceLog.findMany({
            where: { attendanceId },
            orderBy: { performedAt: 'desc' },
        });
    }
    async getAdminStats(tenantId, dto) {
        const startDate = dto.startDate ? new Date(dto.startDate) : new Date(new Date().setDate(1));
        const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
        const where = {
            tenantId,
            workDate: { gte: startDate, lte: endDate },
        };
        const [totalRecords, activeEmployees, lateArrivals, earlyLeaves, flaggedRecords] = await Promise.all([
            this.prisma.attendanceRecord.count({ where }),
            this.prisma.attendanceRecord.groupBy({
                by: ['employeeId'],
                where,
            }),
            this.prisma.attendanceRecord.count({ where: { ...where, isLate: true } }),
            this.prisma.attendanceRecord.count({ where: { ...where, isEarlyLeave: true } }),
            this.prisma.attendanceRecord.count({ where: { ...where, status: 'flagged' } }),
        ]);
        const attendanceByDepartment = await this.prisma.attendanceRecord.groupBy({
            by: ['status'],
            where,
            _count: true,
        });
        return {
            period: { startDate, endDate },
            totalRecords,
            activeEmployees: activeEmployees.length,
            lateArrivals,
            earlyLeaves,
            flaggedRecords,
            attendanceByStatus: attendanceByDepartment.map((d) => ({
                status: d.status,
                count: d._count,
            })),
        };
    }
    async exportAttendance(tenantId, dto) {
        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                tenantId,
                ...(dto.startDate && dto.endDate
                    ? { workDate: { gte: new Date(dto.startDate), lte: new Date(dto.endDate) } }
                    : {}),
                ...(dto.employeeId ? { employeeId: dto.employeeId } : {}),
                ...(dto.departmentId ? { employee: { departmentId: dto.departmentId } } : {}),
            },
            include: {
                employee: {
                    include: { user: true, department: true },
                },
            },
            orderBy: [{ workDate: 'desc' }, { clockIn: 'asc' }],
        });
        return records.map((r) => ({
            employeeId: r.employeeId,
            employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
            employeeNumber: r.employee.employeeNumber,
            department: r.employee.department?.name,
            workDate: r.workDate,
            clockIn: r.clockIn,
            clockOut: r.clockOut,
            totalHours: r.totalMinutes ? Math.round((r.totalMinutes / 60) * 100) / 100 : null,
            breakMinutes: r.breakMinutes,
            isLate: r.isLate,
            isEarlyLeave: r.isEarlyLeave,
            isHolidayWork: r.isHolidayWork,
            status: r.status,
        }));
    }
    async getAllEmployees(tenantId) {
        return this.prisma.employee.findMany({
            where: { tenantId, onboardingStatus: 'employee_active' },
            include: {
                user: true,
                department: true,
            },
            orderBy: { user: { lastName: 'asc' } },
        });
    }
    async getAllDepartments(tenantId) {
        return this.prisma.department.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async checkIsHoliday(tenantId, date, departmentId, locationId) {
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
                assignments: {
                    some: {
                        OR: [
                            { departmentId: departmentId || undefined },
                            { locationId: locationId || undefined },
                            { AND: [{ departmentId: null }, { locationId: null }] },
                        ],
                    },
                },
            },
        });
        return !!holiday;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map