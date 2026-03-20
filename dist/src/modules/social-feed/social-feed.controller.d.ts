import { SocialFeedService } from './social-feed.service';
export declare class SocialFeedController {
    private readonly socialFeedService;
    constructor(socialFeedService: SocialFeedService);
    getPosts(req: any): Promise<({
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
    createPost(req: any, body: {
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
    updatePost(req: any, id: string, body: {
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
    deletePost(req: any, id: string): Promise<void>;
    addReaction(req: any, id: string, body: {
        type: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        postId: string;
        userId: string;
    }>;
    removeReaction(req: any, id: string, body: {
        type: string;
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    addComment(req: any, id: string, body: {
        content: string;
    }): Promise<{
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
    deleteComment(req: any, id: string): Promise<void>;
}
