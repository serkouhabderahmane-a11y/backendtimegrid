"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SocialFeedService = class SocialFeedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPosts(tenantId) {
        return this.prisma.post.findMany({
            where: { tenantId },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
                reactions: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createPost(tenantId, authorId, data) {
        return this.prisma.post.create({
            data: {
                tenantId,
                authorId,
                content: data.content,
                imageUrl: data.imageUrl,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
            },
        });
    }
    async updatePost(postId, tenantId, userId, userRole, data) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, tenantId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId && userRole !== 'admin' && userRole !== 'hr') {
            throw new common_1.ForbiddenException('You can only edit your own posts');
        }
        return this.prisma.post.update({
            where: { id: postId },
            data,
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
            },
        });
    }
    async deletePost(postId, tenantId, userId, userRole) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, tenantId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId && userRole !== 'admin' && userRole !== 'hr') {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
        await this.prisma.post.delete({ where: { id: postId } });
    }
    async addReaction(postId, tenantId, userId, type) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, tenantId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return this.prisma.postReaction.upsert({
            where: { postId_userId_type: { postId, userId, type } },
            create: { postId, userId, type },
            update: { type },
        });
    }
    async removeReaction(postId, userId, type) {
        return this.prisma.postReaction.deleteMany({
            where: { postId, userId, type },
        });
    }
    async addComment(postId, tenantId, userId, content) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, tenantId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return this.prisma.postComment.create({
            data: { postId, userId, content },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async deleteComment(commentId, tenantId, userId, userRole) {
        const comment = await this.prisma.postComment.findFirst({
            where: { id: commentId, post: { tenantId } },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.userId !== userId && userRole !== 'admin' && userRole !== 'hr') {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.postComment.delete({ where: { id: commentId } });
    }
};
exports.SocialFeedService = SocialFeedService;
exports.SocialFeedService = SocialFeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialFeedService);
//# sourceMappingURL=social-feed.service.js.map