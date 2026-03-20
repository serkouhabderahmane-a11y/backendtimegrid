import { MarService } from './mar.service';
export declare class MarController {
    private marService;
    constructor(marService: MarService);
    private getUserContext;
    createMarEntry(req: any, body: {
        employeeId: string;
        medicationName: string;
        scheduledTime: string;
        participantId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    recordOutcome(req: any, id: string, body: {
        outcome: 'given' | 'missed' | 'refused';
        outcomeTime?: string;
        reasonNotGiven?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    lockEntry(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    getMarEntries(req: any, employeeId?: string, outcome?: string, participantId?: string, startDate?: string, endDate?: string): Promise<({
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
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    })[]>;
    getMarEntry(req: any, id: string): Promise<{
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
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        medicationName: string;
        scheduledTime: Date;
        outcome: import("@prisma/client").$Enums.MARStatus;
        outcomeTime: Date | null;
        reasonNotGiven: string | null;
        administeredBy: string | null;
    }>;
    exportMarEntries(req: any, body: {
        startDate: string;
        endDate: string;
        employeeId?: string;
        participantId?: string;
    }): Promise<{
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
            participantId: string | null;
            employee: {
                id: string;
                name: string;
            };
            lockedAt: Date | null;
            lockedBy: string | null;
        }[];
    }>;
}
