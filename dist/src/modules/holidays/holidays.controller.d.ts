import { HolidaysService } from './holidays.service';
import { CreateHolidayDto, UpdateHolidayDto, AssignHolidayDto, HolidayQueryDto } from './dto/holidays.dto';
export declare class HolidaysController {
    private holidaysService;
    constructor(holidaysService: HolidaysService);
    createHoliday(req: any, dto: CreateHolidayDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.HolidayType;
        description: string | null;
        endDate: Date | null;
        date: Date;
        isRecurring: boolean;
    }>;
    getHolidays(req: any, query: HolidayQueryDto): Promise<{
        data: ({
            assignments: ({
                location: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    isActive: boolean;
                    address: string | null;
                } | null;
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
                locationId: string | null;
                departmentId: string | null;
                region: string | null;
                holidayId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            type: import("@prisma/client").$Enums.HolidayType;
            description: string | null;
            endDate: Date | null;
            date: Date;
            isRecurring: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getHoliday(req: any, id: string): Promise<{
        assignments: ({
            location: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                isActive: boolean;
                address: string | null;
            } | null;
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
            locationId: string | null;
            departmentId: string | null;
            region: string | null;
            holidayId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.HolidayType;
        description: string | null;
        endDate: Date | null;
        date: Date;
        isRecurring: boolean;
    }>;
    updateHoliday(req: any, id: string, dto: UpdateHolidayDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.HolidayType;
        description: string | null;
        endDate: Date | null;
        date: Date;
        isRecurring: boolean;
    }>;
    disableHoliday(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.HolidayType;
        description: string | null;
        endDate: Date | null;
        date: Date;
        isRecurring: boolean;
    }>;
    assignHoliday(req: any, id: string, dto: AssignHolidayDto): Promise<{
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            address: string | null;
        } | null;
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
        } | null;
        holiday: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            type: import("@prisma/client").$Enums.HolidayType;
            description: string | null;
            endDate: Date | null;
            date: Date;
            isRecurring: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        locationId: string | null;
        departmentId: string | null;
        region: string | null;
        holidayId: string;
    }>;
    getHolidayAssignments(req: any, id: string): Promise<({
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            address: string | null;
        } | null;
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
        locationId: string | null;
        departmentId: string | null;
        region: string | null;
        holidayId: string;
    })[]>;
    removeAssignment(req: any, assignmentId: string): Promise<{
        success: boolean;
    }>;
    getUpcomingHolidays(req: any): Promise<({
        assignments: {
            id: string;
            createdAt: Date;
            locationId: string | null;
            departmentId: string | null;
            region: string | null;
            holidayId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.HolidayType;
        description: string | null;
        endDate: Date | null;
        date: Date;
        isRecurring: boolean;
    })[]>;
    getAllDepartments(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
    }[]>;
    getAllLocations(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        address: string | null;
    }[]>;
}
