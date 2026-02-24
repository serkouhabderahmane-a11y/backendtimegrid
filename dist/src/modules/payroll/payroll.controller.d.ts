import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private payrollService;
    constructor(payrollService: PayrollService);
    createPayPeriod(req: any, body: {
        name: string;
        startDate: string;
        endDate: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: import("@prisma/client").$Enums.PayPeriodStatus;
        endDate: Date;
        lockedAt: Date | null;
        lockedBy: string | null;
        calculatedAt: Date | null;
        exportedAt: Date | null;
        exportProvider: string | null;
    }>;
    getPayPeriods(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: import("@prisma/client").$Enums.PayPeriodStatus;
        endDate: Date;
        lockedAt: Date | null;
        lockedBy: string | null;
        calculatedAt: Date | null;
        exportedAt: Date | null;
        exportProvider: string | null;
    }[]>;
    getPayPeriod(req: any, id: string): Promise<{
        timeEntries: ({
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
                tenantRoleId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.TimesheetStatus;
            employeeId: string;
            clockIn: Date;
            clockOut: Date | null;
            breakMinutes: number;
            totalMinutes: number | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            payPeriodId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: import("@prisma/client").$Enums.PayPeriodStatus;
        endDate: Date;
        lockedAt: Date | null;
        lockedBy: string | null;
        calculatedAt: Date | null;
        exportedAt: Date | null;
        exportProvider: string | null;
    }>;
    approveTimesheet(req: any, timeEntryId: string, body: {
        approved: boolean;
        rejectionReason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TimesheetStatus;
        employeeId: string;
        clockIn: Date;
        clockOut: Date | null;
        breakMinutes: number;
        totalMinutes: number | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
        payPeriodId: string | null;
    }>;
    lockPayPeriod(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: import("@prisma/client").$Enums.PayPeriodStatus;
        endDate: Date;
        lockedAt: Date | null;
        lockedBy: string | null;
        calculatedAt: Date | null;
        exportedAt: Date | null;
        exportProvider: string | null;
    }>;
    calculatePayroll(req: any, id: string): Promise<{
        payPeriodId: string;
        records: any[];
    }>;
    exportPayroll(req: any, id: string, body: {
        provider: string;
        format: 'csv' | 'excel' | 'api';
    }): Promise<{
        payPeriodReference: string;
        exportDate: Date;
        provider: string;
        format: "csv" | "excel" | "api";
        data: {
            employeeId: string;
            employeeName: string;
            employeeNumber: string | null;
            totalHours: number;
            breakDeductions: number;
            overtimeHours: number;
            overtimePay: number;
            regularPay: number;
            grossPay: number;
            payRate: number;
        }[];
    }>;
    getAuditLogs(req: any, entityType?: string, entityId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValues: string | null;
        newValues: string | null;
        metadata: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
}
