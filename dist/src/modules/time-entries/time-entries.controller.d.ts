import { TimeEntriesService } from './time-entries.service';
export declare class TimeEntriesController {
    private timeEntriesService;
    constructor(timeEntriesService: TimeEntriesService);
    clockIn(req: any): Promise<{
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
    clockOut(req: any): Promise<{
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
    getTodayEntry(req: any): Promise<{
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
    getEntries(req: any, startDate?: string, endDate?: string): Promise<{
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
