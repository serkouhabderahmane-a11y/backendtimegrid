import { PrismaService } from '../../config/config.module';
import { ClockInDto, ClockOutDto, AttendanceQueryDto, AdjustmentDto, EmployeeAttendanceStatsDto } from './dto/attendance.dto';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    private getClientIp;
    private getWorkDate;
    private isHoliday;
    private checkOverlappingTimeOff;
    private logAttendance;
    private createAuditLog;
    clockIn(userId: string, tenantId: string, dto: ClockInDto, request: any): Promise<{
        id: string;
        clockIn: Date;
        workDate: Date;
        isLate: boolean;
        isHolidayWork: boolean;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        employee: {
            id: string;
            name: string;
        };
    }>;
    clockOut(userId: string, tenantId: string, dto: ClockOutDto, request: any): Promise<{
        id: string;
        clockIn: Date;
        clockOut: Date | null;
        totalMinutes: number | null;
        isEarlyLeave: boolean;
        isFlagged: boolean;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        employee: {
            id: string;
            name: string;
        };
    }>;
    getTodayAttendance(userId: string, tenantId: string): Promise<({
        employee: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            locationId: string | null;
            departmentId: string | null;
            startDate: Date;
            employeeNumber: string | null;
            onboardingStatus: import("@prisma/client").$Enums.OnboardingState;
            canClockIn: boolean;
            hourlyRate: number;
            overtimeRate: number;
            tenantRoleId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        ipAddress: string | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        employeeId: string;
        clockIn: Date;
        clockOut: Date | null;
        breakMinutes: number;
        totalMinutes: number | null;
        deviceType: string | null;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        workDate: Date;
        isLate: boolean;
        isEarlyLeave: boolean;
        isHolidayWork: boolean;
        isOvertime: boolean;
    }) | null>;
    getMyAttendance(userId: string, tenantId: string, dto: AttendanceQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        ipAddress: string | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        employeeId: string;
        clockIn: Date;
        clockOut: Date | null;
        breakMinutes: number;
        totalMinutes: number | null;
        deviceType: string | null;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        workDate: Date;
        isLate: boolean;
        isEarlyLeave: boolean;
        isHolidayWork: boolean;
        isOvertime: boolean;
    }[]>;
    getMyStats(userId: string, tenantId: string, dto: EmployeeAttendanceStatsDto): Promise<{
        totalMinutes: number;
        totalHours: number;
        lateCount: number;
        earlyLeaveCount: number;
        presentDays: number;
        holidayWorkCount: number;
        averageHoursPerDay: number;
    } | null>;
    getAdminAttendance(tenantId: string, dto: AttendanceQueryDto): Promise<{
        data: ({
            employee: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    email: string;
                    passwordHash: string;
                    firstName: string;
                    lastName: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    isActive: boolean;
                    lastLoginAt: Date | null;
                };
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    isActive: boolean;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                locationId: string | null;
                departmentId: string | null;
                startDate: Date;
                employeeNumber: string | null;
                onboardingStatus: import("@prisma/client").$Enums.OnboardingState;
                canClockIn: boolean;
                hourlyRate: number;
                overtimeRate: number;
                tenantRoleId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            ipAddress: string | null;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            employeeId: string;
            clockIn: Date;
            clockOut: Date | null;
            breakMinutes: number;
            totalMinutes: number | null;
            deviceType: string | null;
            latitude: number | null;
            longitude: number | null;
            notes: string | null;
            workDate: Date;
            isLate: boolean;
            isEarlyLeave: boolean;
            isHolidayWork: boolean;
            isOvertime: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getEmployeeAttendance(tenantId: string, employeeId: string, dto: AttendanceQueryDto): Promise<{
        employee: {
            id: string;
            name: string;
            department: string | undefined;
            employeeNumber: string | null;
        };
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            ipAddress: string | null;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            employeeId: string;
            clockIn: Date;
            clockOut: Date | null;
            breakMinutes: number;
            totalMinutes: number | null;
            deviceType: string | null;
            latitude: number | null;
            longitude: number | null;
            notes: string | null;
            workDate: Date;
            isLate: boolean;
            isEarlyLeave: boolean;
            isHolidayWork: boolean;
            isOvertime: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    adjustAttendance(tenantId: string, attendanceId: string, dto: AdjustmentDto, userId: string, request: any): Promise<{
        employee: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            locationId: string | null;
            departmentId: string | null;
            startDate: Date;
            employeeNumber: string | null;
            onboardingStatus: import("@prisma/client").$Enums.OnboardingState;
            canClockIn: boolean;
            hourlyRate: number;
            overtimeRate: number;
            tenantRoleId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        ipAddress: string | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        employeeId: string;
        clockIn: Date;
        clockOut: Date | null;
        breakMinutes: number;
        totalMinutes: number | null;
        deviceType: string | null;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        workDate: Date;
        isLate: boolean;
        isEarlyLeave: boolean;
        isHolidayWork: boolean;
        isOvertime: boolean;
    }>;
    getAdjustments(tenantId: string, attendanceId: string): Promise<{
        id: string;
        createdAt: Date;
        newValues: string;
        clockIn: Date | null;
        clockOut: Date | null;
        totalMinutes: number | null;
        reason: string;
        attendanceId: string;
        adjustedBy: string;
        adjustedAt: Date;
        previousValues: string;
    }[]>;
    getAttendanceLogs(tenantId: string, attendanceId: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        ipAddress: string | null;
        userAgent: string | null;
        performedBy: string;
        performedAt: Date;
        details: string | null;
        attendanceId: string;
    }[]>;
    getAdminStats(tenantId: string, dto: AttendanceQueryDto): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalRecords: number;
        activeEmployees: number;
        lateArrivals: number;
        earlyLeaves: number;
        flaggedRecords: number;
        attendanceByStatus: {
            status: import("@prisma/client").$Enums.AttendanceStatus;
            count: number;
        }[];
    }>;
    exportAttendance(tenantId: string, dto: AttendanceQueryDto): Promise<{
        employeeId: string;
        employeeName: string;
        employeeNumber: string | null;
        department: string | undefined;
        workDate: Date;
        clockIn: Date;
        clockOut: Date | null;
        totalHours: number | null;
        breakMinutes: number;
        isLate: boolean;
        isEarlyLeave: boolean;
        isHolidayWork: boolean;
        status: import("@prisma/client").$Enums.AttendanceStatus;
    }[]>;
    getAllEmployees(tenantId: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            lastLoginAt: Date | null;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        locationId: string | null;
        departmentId: string | null;
        startDate: Date;
        employeeNumber: string | null;
        onboardingStatus: import("@prisma/client").$Enums.OnboardingState;
        canClockIn: boolean;
        hourlyRate: number;
        overtimeRate: number;
        tenantRoleId: string | null;
    })[]>;
    getAllDepartments(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
    }[]>;
    private checkIsHoliday;
}
