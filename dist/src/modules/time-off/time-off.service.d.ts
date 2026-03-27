import { PrismaService } from '../../config/config.module';
import { CreateTimeOffRequestDto, ReviewTimeOffDto, CancelTimeOffDto, TimeOffQueryDto, CreateBalanceDto, AdjustBalanceDto } from './dto/time-off.dto';
export declare class TimeOffService {
    private prisma;
    constructor(prisma: PrismaService);
    private getClientIp;
    private calculateBusinessDays;
    private createLog;
    private createAuditLog;
    createRequest(userId: string, tenantId: string, dto: CreateTimeOffRequestDto, request: any): Promise<{
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
    getMyRequests(userId: string, tenantId: string, query: TimeOffQueryDto): Promise<{
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
    getMyBalances(userId: string, tenantId: string): Promise<{
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
    reviewRequest(tenantId: string, requestId: string, dto: ReviewTimeOffDto, userId: string, request: any): Promise<{
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
    cancelMyRequest(userId: string, tenantId: string, requestId: string, dto: CancelTimeOffDto, request: any): Promise<{
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
    getAdminRequests(tenantId: string, query: TimeOffQueryDto): Promise<{
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
    getLeaveCalendar(tenantId: string, query: TimeOffQueryDto): Promise<{
        id: string;
        employeeId: string;
        employeeName: string;
        type: import("@prisma/client").$Enums.TimeOffType;
        startDate: Date;
        endDate: Date;
        totalDays: number;
    }[]>;
    getEmployeeBalances(tenantId: string, employeeId: string): Promise<{
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
    createOrUpdateBalance(tenantId: string, employeeId: string, dto: CreateBalanceDto, userId: string, request: any): Promise<any>;
    adjustBalance(tenantId: string, balanceId: string, dto: AdjustBalanceDto, userId: string, request: any): Promise<{
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
    getRequestLogs(tenantId: string, requestId: string): Promise<{
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
    getBalanceHistory(tenantId: string, balanceId: string): Promise<{
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
    getAdminStats(tenantId: string, query: TimeOffQueryDto): Promise<{
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
    private getOrCreateBalance;
    private checkHolidayOverlap;
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
}
