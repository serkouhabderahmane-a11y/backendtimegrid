import { PrismaService } from '../../config/config.module';
import { CreateHolidayDto, UpdateHolidayDto, AssignHolidayDto, HolidayQueryDto } from './dto/holidays.dto';
export declare class HolidaysService {
    private prisma;
    constructor(prisma: PrismaService);
    private createAuditLog;
    createHoliday(tenantId: string, dto: CreateHolidayDto, userId: string): Promise<{
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
    updateHoliday(tenantId: string, holidayId: string, dto: UpdateHolidayDto, userId: string): Promise<{
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
    disableHoliday(tenantId: string, holidayId: string, userId: string): Promise<{
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
    getHoliday(tenantId: string, holidayId: string): Promise<{
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
    getHolidays(tenantId: string, query: HolidayQueryDto): Promise<{
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
    assignHoliday(tenantId: string, holidayId: string, dto: AssignHolidayDto, userId: string): Promise<{
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
    removeAssignment(tenantId: string, assignmentId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getHolidayAssignments(tenantId: string, holidayId: string): Promise<({
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
    getUpcomingHolidays(tenantId: string, departmentId?: string, locationId?: string): Promise<({
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
    getAllDepartments(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
    }[]>;
    getAllLocations(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        address: string | null;
    }[]>;
    checkDateIsHoliday(tenantId: string, date: Date, departmentId?: string, locationId?: string): Promise<boolean>;
}
