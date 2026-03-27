import { SharingService } from './sharing.service';
export declare class SharingController {
    private sharingService;
    constructor(sharingService: SharingService);
    createShareLink(req: any, body: {
        entityType: 'daily_note' | 'mar';
        entityId: string;
        expiresInHours?: number;
    }): Promise<{
        id: string;
        token: string;
        expiresAt: Date;
        shareUrl: string;
    }>;
    getActiveShareLinks(req: any): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        token: string;
        expiresAt: Date;
        shareUrl: string;
    }[]>;
    revokeShareLink(req: any, token: string): Promise<{
        success: boolean;
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
}
