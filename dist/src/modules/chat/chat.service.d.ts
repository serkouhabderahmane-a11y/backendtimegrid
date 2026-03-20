import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(tenantId: string, userId: string): Promise<{
        id: string;
        participants: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
        lastMessage: {
            content: string;
            createdAt: Date;
        } | null;
        updatedAt: Date;
    }[]>;
    getOrCreateConversation(tenantId: string, userId: string, otherUserId: string): Promise<{
        id: string;
        participants: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    }>;
    getConversation(conversationId: string, tenantId: string, userId: string): Promise<{
        id: string;
        participants: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    }>;
    getMessages(conversationId: string, tenantId: string, userId: string, limit?: number, before?: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
        isRead: boolean;
    })[]>;
    sendMessage(conversationId: string, tenantId: string, senderId: string, content: string): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
        isRead: boolean;
    }>;
    markAsRead(conversationId: string, tenantId: string, userId: string): Promise<void>;
    getUsers(tenantId: string, excludeUserId: string, search?: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    getUnreadCount(tenantId: string, userId: string): Promise<number>;
}
