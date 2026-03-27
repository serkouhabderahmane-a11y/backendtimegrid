import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

export interface UserContext {
  userId: string;
  role: string;
  employeeId?: string;
}

@Injectable()
export class MarService {
  constructor(private prisma: PrismaService) {}

  private async logAudit(
    tenantId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        metadata: JSON.stringify(metadata),
      },
    });
  }

  private canAccessMar(userContext: UserContext): boolean {
    const allowedRoles = ['admin', 'manager', 'supervisor', 'employee'];
    return allowedRoles.includes(userContext.role);
  }

  private canEditMar(userContext: UserContext): boolean {
    const editorRoles = ['admin', 'manager', 'supervisor'];
    return editorRoles.includes(userContext.role);
  }

  private canRecordOutcome(userContext: UserContext): boolean {
    const allowedRoles = ['admin', 'manager', 'supervisor', 'nurse', 'med_tech'];
    return allowedRoles.includes(userContext.role);
  }

  private filterByAccess(userContext: UserContext, baseWhere: any): any {
    if (userContext.role === 'employee' && userContext.employeeId) {
      return { ...baseWhere, employeeId: userContext.employeeId };
    }
    return baseWhere;
  }

  async createMarEntry(
    tenantId: string, 
    userId: string, 
    employeeId: string, 
    data: {
      medicationName: string;
      scheduledTime: Date;
      participantId?: string;
    },
    userContext: UserContext
  ) {
    if (!this.canAccessMar(userContext)) {
      throw new ForbiddenException('You do not have permission to access MAR records');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== employeeId) {
      throw new ForbiddenException('Employees can only create MAR records for themselves');
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const created = await this.prisma.medicationAdministrationRecord.create({
      data: {
        tenantId,
        employeeId,
        medicationName: data.medicationName,
        scheduledTime: data.scheduledTime,
        outcome: 'scheduled',
        participantId: data.participantId,
      },
    });

    await this.logAudit(tenantId, userId, 'CREATE_MAR_ENTRY', 'MedicationAdministrationRecord', created.id);

    return created;
  }

  async recordOutcome(
    tenantId: string,
    userId: string,
    id: string,
    data: {
      outcome: 'given' | 'missed' | 'refused';
      outcomeTime?: Date;
      reasonNotGiven?: string;
    },
    userContext: UserContext
  ) {
    if (!this.canAccessMar(userContext)) {
      throw new ForbiddenException('You do not have permission to access MAR records');
    }

    const entry = await this.prisma.medicationAdministrationRecord.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('MAR entry not found');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== entry.employeeId) {
      throw new ForbiddenException('Cannot modify other employees\' MAR entries');
    }

    if (entry.outcome === 'locked') {
      throw new ForbiddenException('Cannot modify locked MAR entry');
    }

    const updated = await this.prisma.medicationAdministrationRecord.update({
      where: { id },
      data: {
        outcome: data.outcome,
        outcomeTime: data.outcomeTime || new Date(),
        reasonNotGiven: data.reasonNotGiven,
        administeredBy: userId,
      },
    });

    await this.logAudit(tenantId, userId, 'RECORD_MAR_OUTCOME', 'MedicationAdministrationRecord', id, {
      outcome: data.outcome,
    });

    return updated;
  }

  async autoLockEntry(tenantId: string, id: string) {
    const entry = await this.prisma.medicationAdministrationRecord.findFirst({
      where: { id, tenantId },
    });

    if (!entry || entry.outcome === 'locked') {
      return entry;
    }

    return this.prisma.medicationAdministrationRecord.update({
      where: { id },
      data: {
        outcome: 'locked',
        lockedAt: new Date(),
        lockedBy: 'system',
      },
    });
  }

  async lockEntry(tenantId: string, userId: string, id: string, userContext: UserContext) {
    if (!this.canEditMar(userContext)) {
      throw new ForbiddenException('You do not have permission to lock MAR records');
    }

    const entry = await this.prisma.medicationAdministrationRecord.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('MAR entry not found');
    }

    if (entry.outcome === 'locked') {
      throw new ForbiddenException('MAR entry is already locked');
    }

    const updated = await this.prisma.medicationAdministrationRecord.update({
      where: { id },
      data: {
        outcome: 'locked',
        lockedAt: new Date(),
        lockedBy: userId,
      },
    });

    await this.logAudit(tenantId, userId, 'LOCK_MAR_ENTRY', 'MedicationAdministrationRecord', id, {
      lockedAt: new Date(),
    });

    return updated;
  }

  async getMarEntries(
    tenantId: string, 
    userId: string,
    params: {
      employeeId?: string;
      outcome?: string;
      participantId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    userContext: UserContext
  ) {
    if (!this.canAccessMar(userContext)) {
      throw new ForbiddenException('You do not have permission to access MAR records');
    }

    const where: any = this.filterByAccess(userContext, { tenantId });
    
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.outcome) where.outcome = params.outcome;
    if (params.participantId) where.participantId = params.participantId;
    if (params.startDate && params.endDate) {
      where.scheduledTime = { gte: params.startDate, lte: params.endDate };
    }

    return this.prisma.medicationAdministrationRecord.findMany({
      where,
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { scheduledTime: 'desc' },
    });
  }

  async getMarEntry(tenantId: string, id: string, userContext: UserContext) {
    if (!this.canAccessMar(userContext)) {
      throw new ForbiddenException('You do not have permission to access MAR records');
    }

    const entry = await this.prisma.medicationAdministrationRecord.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          include: { user: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('MAR entry not found');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== entry.employeeId) {
      throw new ForbiddenException('Cannot view other employees\' MAR entries');
    }

    return entry;
  }

  async exportMarEntries(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
    params?: { participantId?: string; employeeId?: string },
    userContext?: UserContext
  ) {
    if (userContext && !this.canAccessMar(userContext)) {
      throw new ForbiddenException('You do not have permission to export MAR records');
    }

    const where: any = {
      tenantId,
      scheduledTime: { gte: startDate, lte: endDate },
    };

    if (params?.participantId) where.participantId = params.participantId;
    if (params?.employeeId) where.employeeId = params.employeeId;

    if (userContext?.role === 'employee' && userContext.employeeId) {
      where.employeeId = userContext.employeeId;
    }

    const entries = await this.prisma.medicationAdministrationRecord.findMany({
      where,
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    const exportData = entries.map(entry => ({
      medicationName: entry.medicationName,
      scheduledTime: entry.scheduledTime,
      outcome: entry.outcome,
      outcomeTime: entry.outcomeTime,
      reasonNotGiven: entry.reasonNotGiven,
      staffReference: entry.administeredBy,
      participantId: entry.participantId,
      employee: {
        id: entry.employeeId,
        name: `${entry.employee.user.firstName} ${entry.employee.user.lastName}`,
      },
      lockedAt: entry.lockedAt,
      lockedBy: entry.lockedBy,
    }));

    await this.logAudit(tenantId, userId, 'EXPORT_MAR', 'MedicationAdministrationRecord', undefined, {
      startDate,
      endDate,
      participantId: params?.participantId,
      entriesCount: entries.length,
    });

    return {
      startDate,
      endDate,
      exportDate: new Date(),
      entriesCount: entries.length,
      data: exportData,
    };
  }
}
