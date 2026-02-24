import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

export interface AuditLogData {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogger {
  private readonly logger = new Logger(AuditLogger.name);

  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
          newValues: data.newValues ? JSON.stringify(data.newValues) : null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${error.message}`, error.stack);
    }
  }

  async logStateTransition(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldState: string,
    newState: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'STATE_TRANSITION',
      entityType,
      entityId,
      oldValues: { state: oldState },
      newValues: { state: newState },
      metadata,
    });
  }

  async logCreate(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    values: Record<string, any>,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      newValues: values,
    });
  }

  async logUpdate(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
    });
  }

  async logDelete(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
    });
  }
}
