import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto, AttendanceQueryDto, AdjustmentDto } from './dto/attendance.dto';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    clockIn(req: any, dto: ClockInDto): Promise<{
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
    clockOut(req: any, dto: ClockOutDto): Promise<{
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
    getTodayAttendance(req: any): Promise<({
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
    getMyAttendance(req: any, query: AttendanceQueryDto): Promise<{
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
    getMyStats(req: any, query: AttendanceQueryDto): Promise<{
        totalMinutes: number;
        totalHours: number;
        lateCount: number;
        earlyLeaveCount: number;
        presentDays: number;
        holidayWorkCount: number;
        averageHoursPerDay: number;
    } | null>;
    getAdminAttendance(req: any, query: AttendanceQueryDto): Promise<{
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
    getAdminStats(req: any, query: AttendanceQueryDto): Promise<{
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
    exportAttendance(req: any, query: AttendanceQueryDto): Promise<{
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
    getAllEmployees(req: any): Promise<({
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
    getAllDepartments(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
    }[]>;
    getEmployeeAttendance(req: any, employeeId: string, query: AttendanceQueryDto): Promise<{
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
    adjustAttendance(req: any, id: string, dto: AdjustmentDto): Promise<{
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
    getAdjustments(req: any, id: string): Promise<{
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
    getAttendanceLogs(req: any, id: string): Promise<{
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
}
