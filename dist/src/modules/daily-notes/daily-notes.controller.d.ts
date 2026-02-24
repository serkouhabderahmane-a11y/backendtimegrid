import { DailyNotesService } from './daily-notes.service';
export declare class DailyNotesController {
    private dailyNotesService;
    constructor(dailyNotesService: DailyNotesService);
    createNote(req: any, body: {
        employeeId: string;
        date: string;
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
    submitNote(req: any, id: string): Promise<{
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
    getNotes(req: any, employeeId?: string, status?: string): Promise<({
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
    getNote(req: any, id: string): Promise<{
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
    reviewNote(req: any, id: string): Promise<{
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
    lockNote(req: any, id: string): Promise<{
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
    exportNotes(req: any, body: {
        startDate: string;
        endDate: string;
    }): Promise<{
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
