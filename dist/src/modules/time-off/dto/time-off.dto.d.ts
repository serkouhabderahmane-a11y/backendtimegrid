import { TimeOffType, TimeOffStatus } from '@prisma/client';
export declare class CreateTimeOffRequestDto {
    type: TimeOffType;
    startDate: string;
    endDate: string;
    reason?: string;
}
export declare class UpdateTimeOffRequestDto {
    status?: TimeOffStatus;
    reviewComment?: string;
}
export declare class ReviewTimeOffDto {
    status: TimeOffStatus;
    comment?: string;
}
export declare class CancelTimeOffDto {
    reason?: string;
}
export declare class TimeOffQueryDto {
    startDate?: string;
    endDate?: string;
    type?: TimeOffType;
    status?: TimeOffStatus;
    employeeId?: string;
    page?: number;
    limit?: number;
}
export declare class CreateBalanceDto {
    type: TimeOffType;
    totalDays: number;
    year: number;
    carryOverDays?: number;
}
export declare class UpdateBalanceDto {
    totalDays?: number;
    usedDays?: number;
    pendingDays?: number;
    carryOverDays?: number;
}
export declare class AdjustBalanceDto {
    totalDays: number;
    usedDays?: number;
    carryOverDays?: number;
    reason: string;
}
