import { PrismaService } from '../prisma.service';
export declare class SocialFeedService {
    private prisma;
    constructor(prisma: PrismaService);
    getPosts(tenantId: string): Promise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        reactions: {
            id: string;
            createdAt: Date;
            type: string;
            postId: string;
            userId: string;
        }[];
        comments: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            postId: string;
            userId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        authorId: string;
        content: string;
        imageUrl: string | null;
        isPinned: boolean;
    })[]>;
    createPost(tenantId: string, authorId: string, data: {
        content: string;
        imageUrl?: string;
    }): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        authorId: string;
        content: string;
        imageUrl: string | null;
        isPinned: boolean;
    }>;
    updatePost(postId: string, tenantId: string, userId: string, userRole: string, data: {
        content?: string;
        imageUrl?: string;
        isPinned?: boolean;
    }): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        authorId: string;
        content: string;
        imageUrl: string | null;
        isPinned: boolean;
    }>;
    deletePost(postId: string, tenantId: string, userId: string, userRole: string): Promise<void>;
    addReaction(postId: string, tenantId: string, userId: string, type: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        postId: string;
        userId: string;
    }>;
    removeReaction(postId: string, userId: string, type: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    addComment(postId: string, tenantId: string, userId: string, content: string): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        postId: string;
        userId: string;
    }>;
    deleteComment(commentId: string, tenantId: string, userId: string, userRole: string): Promise<void>;
}
