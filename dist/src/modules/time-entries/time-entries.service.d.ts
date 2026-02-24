import { PrismaService } from '../../config/config.module';
export declare class TimeEntriesService {
    private prisma;
    constructor(prisma: PrismaService);
    clockIn(userId: string, tenantId: string): Promise<{
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
    clockOut(userId: string, tenantId: string): Promise<{
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
    getTodayEntry(userId: string, tenantId: string): Promise<{
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
    } | null>;
    getEntries(userId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<{
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
    }[]>;
}
