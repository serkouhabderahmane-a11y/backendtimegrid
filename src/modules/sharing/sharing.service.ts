import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class SharingService {
  constructor(private prisma: PrismaService) {}

  async createShareLink(
    tenantId: string,
    userId: string,
    entityType: 'daily_note' | 'mar',
    entityId: string,
    expiresInHours: number = 24,
  ) {
    const entity = await this.prisma.dailyNote.findFirst({
      where: { id: entityId, tenantId },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const shareLink = await this.prisma.sharedLink.create({
      data: {
        tenantId,
        entityType,
        entityId,
        token,
        expiresAt,
        createdBy: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE_SHARE_LINK',
        entityType,
        entityId,
        metadata: JSON.stringify({ expiresAt, expiresInHours }),
      },
    });

    return {
      id: shareLink.id,
      token: shareLink.token,
      expiresAt: shareLink.expiresAt,
      shareUrl: `/shared/${token}`,
    };
  }

  async accessSharedContent(token: string) {
    const shareLink = await this.prisma.sharedLink.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found or expired');
    }

    if (shareLink.entityType === 'daily_note') {
      const note = await this.prisma.dailyNote.findFirst({
        where: { id: shareLink.entityId },
        include: {
          employee: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      return {
        type: 'daily_note',
        data: {
          id: note.id,
          date: note.date,
          content: note.content,
          employeeName: `${note.employee.user.firstName} ${note.employee.user.lastName}`,
          status: note.status,
          createdAt: note.createdAt,
        },
        expiresAt: shareLink.expiresAt,
      };
    }

    if (shareLink.entityType === 'mar') {
      const entry = await this.prisma.medicationAdministrationRecord.findFirst({
        where: { id: shareLink.entityId },
        include: {
          employee: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });

      if (!entry) {
        throw new NotFoundException('MAR entry not found');
      }

      return {
        type: 'mar',
        data: {
          id: entry.id,
          medicationName: entry.medicationName,
          scheduledTime: entry.scheduledTime,
          outcome: entry.outcome,
          outcomeTime: entry.outcomeTime,
          employeeName: `${entry.employee.user.firstName} ${entry.employee.user.lastName}`,
          createdAt: entry.createdAt,
        },
        expiresAt: shareLink.expiresAt,
      };
    }

    throw new BadRequestException('Unknown entity type');
  }

  async revokeShareLink(tenantId: string, userId: string, token: string) {
    const shareLink = await this.prisma.sharedLink.findFirst({
      where: { token, tenantId },
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found');
    }

    await this.prisma.sharedLink.delete({
      where: { id: shareLink.id },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'REVOKE_SHARE_LINK',
        entityType: shareLink.entityType,
        entityId: shareLink.entityId,
      },
    });

    return { success: true };
  }

  async getActiveShareLinks(tenantId: string, userId: string) {
    const links = await this.prisma.sharedLink.findMany({
      where: {
        tenantId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return links.map(link => ({
      id: link.id,
      entityType: link.entityType,
      entityId: link.entityId,
      token: link.token,
      expiresAt: link.expiresAt,
      shareUrl: `/shared/${link.token}`,
    }));
  }
}
