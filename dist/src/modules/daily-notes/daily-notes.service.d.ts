import { PrismaService } from '../../config/config.module';
export declare class DailyNotesService {
    private prisma;
    constructor(prisma: PrismaService);
    private logAudit;
    createNote(tenantId: string, userId: string, employeeId: string, data: {
        date: Date;
        content: string;
        attachments?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    }>;
    submitNote(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    }>;
    getNotes(tenantId: string, employeeId?: string, status?: string): Promise<({
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
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    })[]>;
    getNote(tenantId: string, id: string): Promise<{
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
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    }>;
    reviewNote(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    }>;
    lockNote(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        date: Date;
        content: string;
        attachments: string;
        reviewedBy: string | null;
    }>;
    exportNotes(tenantId: string, userId: string, startDate: Date, endDate: Date): Promise<{
        startDate: Date;
        endDate: Date;
        exportDate: Date;
        notesCount: number;
        data: {
            noteId: string;
            date: Date;
            content: string;
            attachments: any;
            author: {
                id: string;
                name: string;
            };
            reviewedAt: Date | null;
            reviewedBy: string | null;
            lockedAt: Date | null;
            lockedBy: string | null;
        }[];
    }>;
}
