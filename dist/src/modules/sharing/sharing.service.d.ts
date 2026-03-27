import { PrismaService } from '../../config/config.module';
export declare class SharingService {
    private prisma;
    constructor(prisma: PrismaService);
    createShareLink(tenantId: string, userId: string, entityType: 'daily_note' | 'mar', entityId: string, expiresInHours?: number): Promise<{
        id: string;
        token: string;
        expiresAt: Date;
        shareUrl: string;
    }>;
    accessSharedContent(token: string): Promise<{
        type: string;
        data: {
            id: string;
            date: Date;
            content: string;
            employeeName: string;
            status: import("@prisma/client").$Enums.DailyNoteStatus;
            createdAt: Date;
            medicationName?: undefined;
            scheduledTime?: undefined;
            outcome?: undefined;
            outcomeTime?: undefined;
        };
        expiresAt: Date;
    } | {
        type: string;
        data: {
            id: string;
            medicationName: string;
            scheduledTime: Date;
            outcome: import("@prisma/client").$Enums.MARStatus;
            outcomeTime: Date | null;
            employeeName: string;
            createdAt: Date;
            date?: undefined;
            content?: undefined;
            status?: undefined;
        };
        expiresAt: Date;
    }>;
    revokeShareLink(tenantId: string, userId: string, token: string): Promise<{
        success: boolean;
    }>;
    getActiveShareLinks(tenantId: string, userId: string): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        token: string;
        expiresAt: Date;
        shareUrl: string;
    }[]>;
}
