import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(tenantId: string, userId: string) {
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

  async getOrCreateConversation(tenantId: string, userId: string, otherUserId: string) {
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

  async getConversation(conversationId: string, tenantId: string, userId: string) {
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
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.user),
    };
  }

  async getMessages(conversationId: string, tenantId: string, userId: string, limit = 50, before?: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, participants: { some: { userId } } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const where: any = { conversationId };
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

  async sendMessage(conversationId: string, tenantId: string, senderId: string, content: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, participants: { some: { userId: senderId } } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
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

  async markAsRead(conversationId: string, tenantId: string, userId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
  }

  async getUsers(tenantId: string, excludeUserId: string, search?: string) {
    const where: any = { tenantId, isActive: true, id: { not: excludeUserId } };
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

  async getUnreadCount(tenantId: string, userId: string) {
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
}
