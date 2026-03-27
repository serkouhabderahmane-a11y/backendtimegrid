import { AttendanceStatus } from '@prisma/client';
export declare class ClockInDto {
    deviceType?: string;
    latitude?: number;
    longitude?: number;
}
export declare class ClockOutDto {
    notes?: string;
}
export declare class AttendanceQueryDto {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    departmentId?: string;
    status?: AttendanceStatus;
    page?: number;
    limit?: number;
}
export declare class AdjustmentDto {
    clockIn?: string;
    clockOut?: string;
    totalMinutes?: number;
    reason: string;
}
export declare class EmployeeAttendanceStatsDto {
    startDate?: string;
    endDate?: string;
}
