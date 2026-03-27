import { PrismaService } from '../../config/config.module';
export interface UserContext {
    userId: string;
    role: string;
    employeeId?: string;
}
export declare class DailyNotesService {
    private prisma;
    constructor(prisma: PrismaService);
    private logAudit;
    private canAccessNotes;
    private canEditNote;
    private filterByAccess;
    private canReviewOrLock;
    createNote(tenantId: string, userId: string, employeeId: string, data: {
        date: Date;
        content: string;
        attachments?: string[];
        participantId?: string;
    }, userContext: UserContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    submitNote(tenantId: string, userId: string, id: string, userContext: UserContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    updateNote(tenantId: string, userId: string, id: string, data: {
        content?: string;
        date?: Date;
        participantId?: string;
        attachments?: string[];
    }, userContext: UserContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    getNotes(tenantId: string, userId: string, params: {
        employeeId?: string;
        status?: string;
        participantId?: string;
        startDate?: Date;
        endDate?: Date;
    }, userContext: UserContext): Promise<({
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
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    })[]>;
    getNote(tenantId: string, id: string, userContext: UserContext): Promise<{
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
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    reviewNote(tenantId: string, userId: string, id: string, userContext: UserContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    lockNote(tenantId: string, userId: string, id: string, userContext: UserContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        status: import("@prisma/client").$Enums.DailyNoteStatus;
        reviewedAt: Date | null;
        employeeId: string;
        lockedAt: Date | null;
        lockedBy: string | null;
        participantId: string | null;
        date: Date;
        attachments: string;
        reviewedBy: string | null;
    }>;
    exportNotes(tenantId: string, userId: string, startDate: Date, endDate: Date, params?: {
        participantId?: string;
    }, userContext?: UserContext): Promise<{
        startDate: Date;
        endDate: Date;
        exportDate: Date;
        notesCount: number;
        data: {
            noteId: string;
            date: Date;
            content: string;
            participantId: string | null;
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
