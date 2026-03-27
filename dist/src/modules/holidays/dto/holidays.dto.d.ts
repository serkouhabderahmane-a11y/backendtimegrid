import { HolidayType } from '@prisma/client';
export declare class CreateHolidayDto {
    name: string;
    date: string;
    endDate?: string;
    type: HolidayType;
    description?: string;
    isRecurring?: boolean;
}
export declare class UpdateHolidayDto {
    name?: string;
    date?: string;
    endDate?: string;
    type?: HolidayType;
    description?: string;
    isRecurring?: boolean;
    isActive?: boolean;
}
export declare class AssignHolidayDto {
    departmentId?: string;
    locationId?: string;
    region?: string;
}
export declare class HolidayQueryDto {
    startDate?: string;
    endDate?: string;
    type?: HolidayType;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
