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
export declare class AuditLogger {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<void>;
    logStateTransition(tenantId: string, userId: string | undefined, entityType: string, entityId: string, oldState: string, newState: string, metadata?: Record<string, any>): Promise<void>;
    logCreate(tenantId: string, userId: string | undefined, entityType: string, entityId: string, values: Record<string, any>): Promise<void>;
    logUpdate(tenantId: string, userId: string | undefined, entityType: string, entityId: string, oldValues: Record<string, any>, newValues: Record<string, any>): Promise<void>;
    logDelete(tenantId: string, userId: string | undefined, entityType: string, entityId: string, oldValues: Record<string, any>): Promise<void>;
}
