import { PrismaService } from '../../config/config.module';
export declare class MarService {
    private prisma;
    constructor(prisma: PrismaService);
    private logAudit;
    createMarEntry(tenantId: string, userId: string, employeeId: string, data: {
        medicationName: string;
        scheduledTime: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    recordOutcome(tenantId: string, userId: string, id: string, data: {
        outcome: 'given' | 'missed' | 'refused';
        outcomeTime?: Date;
        reasonNotGiven?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    autoLockEntry(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    } | null>;
    lockEntry(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    getMarEntries(tenantId: string, employeeId?: string, outcome?: string): Promise<({
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
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    })[]>;
    getMarEntry(tenantId: string, id: string): Promise<{
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
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    exportMarEntries(tenantId: string, userId: string, startDate: Date, endDate: Date, employeeId?: string): Promise<{
        startDate: Date;
        endDate: Date;
        exportDate: Date;
        entriesCount: number;
        data: {
            medicationName: string;
            scheduledTime: Date;
            outcome: import("@prisma/client").$Enums.MARStatus;
            outcomeTime: Date | null;
            reasonNotGiven: string | null;
            staffReference: string | null;
            employee: {
                id: string;
                name: string;
            };
            lockedAt: Date | null;
            lockedBy: string | null;
        }[];
    }>;
}
