import { TimeOffService } from './time-off.service';
import { CreateTimeOffRequestDto, ReviewTimeOffDto, CancelTimeOffDto, TimeOffQueryDto, CreateBalanceDto, AdjustBalanceDto } from './dto/time-off.dto';
export declare class TimeOffController {
    private timeOffService;
    constructor(timeOffService: TimeOffService);
    createRequest(req: any, dto: CreateTimeOffRequestDto): Promise<{
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
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        status: import("@prisma/client").$Enums.TimeOffStatus;
        reviewedAt: Date | null;
        reviewComment: string | null;
        employeeId: string;
        endDate: Date;
        reviewedBy: string | null;
        reason: string | null;
        totalDays: number;
    }>;
    getMyRequests(req: any, query: TimeOffQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        status: import("@prisma/client").$Enums.TimeOffStatus;
        reviewedAt: Date | null;
        reviewComment: string | null;
        employeeId: string;
        endDate: Date;
        reviewedBy: string | null;
        reason: string | null;
        totalDays: number;
    }[]>;
    getMyBalances(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        year: number;
        employeeId: string;
        totalDays: number;
        carryOverDays: number;
        usedDays: number;
        pendingDays: number;
    }[]>;
    cancelRequest(req: any, id: string, dto: CancelTimeOffDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        status: import("@prisma/client").$Enums.TimeOffStatus;
        reviewedAt: Date | null;
        reviewComment: string | null;
        employeeId: string;
        endDate: Date;
        reviewedBy: string | null;
        reason: string | null;
        totalDays: number;
    }>;
    getAdminRequests(req: any, query: TimeOffQueryDto): Promise<{
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
            type: import("@prisma/client").$Enums.TimeOffType;
            startDate: Date;
            status: import("@prisma/client").$Enums.TimeOffStatus;
            reviewedAt: Date | null;
            reviewComment: string | null;
            employeeId: string;
            endDate: Date;
            reviewedBy: string | null;
            reason: string | null;
            totalDays: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    reviewRequest(req: any, id: string, dto: ReviewTimeOffDto): Promise<{
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
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        status: import("@prisma/client").$Enums.TimeOffStatus;
        reviewedAt: Date | null;
        reviewComment: string | null;
        employeeId: string;
        endDate: Date;
        reviewedBy: string | null;
        reason: string | null;
        totalDays: number;
    }>;
    getLeaveCalendar(req: any, query: TimeOffQueryDto): Promise<{
        id: string;
        employeeId: string;
        employeeName: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        endDate: Date;
        totalDays: number;
    }[]>;
    getAdminStats(req: any, query: TimeOffQueryDto): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        canceled: number;
        total: number;
        byType: {
            type: import("@prisma/client").$Enums.TimeOffType;
            count: number;
        }[];
    }>;
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
    getEmployeeBalances(req: any, employeeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        year: number;
        employeeId: string;
        totalDays: number;
        carryOverDays: number;
        usedDays: number;
        pendingDays: number;
    }[]>;
    createOrUpdateBalance(req: any, employeeId: string, dto: CreateBalanceDto): Promise<any>;
    adjustBalance(req: any, balanceId: string, dto: AdjustBalanceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        year: number;
        employeeId: string;
        totalDays: number;
        carryOverDays: number;
        usedDays: number;
        pendingDays: number;
    }>;
    getRequestLogs(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        action: string;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        employeeId: string;
        reason: string | null;
        performedBy: string;
        performedAt: Date;
        previousValues: string | null;
        timeOffRequestId: string | null;
        balanceId: string | null;
    }[]>;
    getBalanceHistory(req: any, balanceId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        action: string;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        employeeId: string;
        reason: string | null;
        performedBy: string;
        performedAt: Date;
        previousValues: string | null;
        timeOffRequestId: string | null;
        balanceId: string | null;
    }[]>;
}
