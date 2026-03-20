import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<{
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
    getUsers(req: any, search?: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    createOrGetConversation(req: any, body: {
        userId: string;
    }): Promise<{
        id: string;
        participants: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    }>;
    getConversation(req: any, id: string): Promise<{
        id: string;
        participants: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    }>;
    getMessages(req: any, id: string, limit?: string, before?: string): Promise<({
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
    sendMessage(req: any, id: string, body: {
        content: string;
    }): Promise<{
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
    markAsRead(req: any, id: string): Promise<void>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
}
