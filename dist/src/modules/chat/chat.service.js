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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(tenantId, userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                tenantId,
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, role: true },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return conversations.map((conv) => {
            const otherParticipants = conv.participants.filter((p) => p.userId !== userId);
            const lastMessage = conv.messages[0];
            const unreadCount = conv.participants.find((p) => p.userId === userId)
                ? 0
                : 0;
            return {
                id: conv.id,
                participants: otherParticipants.map((p) => p.user),
                lastMessage: lastMessage
                    ? { content: lastMessage.content, createdAt: lastMessage.createdAt }
                    : null,
                updatedAt: conv.updatedAt,
            };
        });
    }
    async getOrCreateConversation(tenantId, userId, otherUserId) {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                tenantId,
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    where: { userId: otherUserId },
                },
            },
        });
        if (existing && existing.participants.length > 0) {
            return this.getConversation(existing.id, tenantId, userId);
        }
        const conversation = await this.prisma.conversation.create({
            data: {
                tenantId,
                participants: {
                    create: [{ userId }, { userId: otherUserId }],
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, role: true },
                        },
                    },
                },
            },
        });
        return {
            id: conversation.id,
            participants: conversation.participants.map((p) => p.user),
        };
    }
    async getConversation(conversationId, tenantId, userId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId, participants: { some: { userId } } },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, role: true },
                        },
                    },
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return {
            id: conversation.id,
            participants: conversation.participants.map((p) => p.user),
        };
    }
    async getMessages(conversationId, tenantId, userId, limit = 50, before) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId, participants: { some: { userId } } },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const where = { conversationId };
        if (before) {
            where.createdAt = { lt: new Date(before) };
        }
        const messages = await this.prisma.message.findMany({
            where,
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return messages.reverse();
    }
    async sendMessage(conversationId, tenantId, senderId, content) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId, participants: { some: { userId: senderId } } },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: { conversationId, senderId, content },
                include: {
                    sender: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            }),
        ]);
        return message;
    }
    async markAsRead(conversationId, tenantId, userId) {
        await this.prisma.conversationParticipant.updateMany({
            where: { conversationId, userId },
            data: { lastReadAt: new Date() },
        });
        await this.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, isRead: false },
            data: { isRead: true },
        });
    }
    async getUsers(tenantId, excludeUserId, search) {
        const where = { tenantId, isActive: true, id: { not: excludeUserId } };
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
            ];
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
            },
            take: 20,
        });
    }
    async getUnreadCount(tenantId, userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: { tenantId, participants: { some: { userId } } },
            include: {
                participants: true,
                messages: {
                    where: { senderId: { not: userId }, isRead: false },
                },
            },
        });
        return conversations.reduce((sum, c) => sum + c.messages.length, 0);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map