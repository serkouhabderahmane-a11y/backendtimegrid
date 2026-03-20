import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

export interface UserContext {
  userId: string;
  role: string;
  employeeId?: string;
}

@Injectable()
export class DailyNotesService {
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

  private canAccessNotes(userContext: UserContext): boolean {
    if (userContext.role === 'hr') {
      return false;
    }
    return true;
  }

  private filterByAccess(userContext: UserContext, baseWhere: any): any {
    if (userContext.role === 'employee' && userContext.employeeId) {
      return { ...baseWhere, employeeId: userContext.employeeId };
    }
    return baseWhere;
  }

  async createNote(tenantId: string, userId: string, employeeId: string, data: {
    date: Date;
    content: string;
    attachments?: string[];
    participantId?: string;
  }, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const dateStart = new Date(data.date);
    dateStart.setHours(0, 0, 0, 0);

    const existingNote = await this.prisma.dailyNote.findFirst({
      where: {
        tenantId,
        employeeId,
        date: { gte: dateStart, lt: new Date(dateStart.getTime() + 86400000) },
      },
    });

    if (existingNote) {
      if (existingNote.status === 'locked') {
        throw new ForbiddenException('Cannot edit locked note');
      }
      const updated = await this.prisma.dailyNote.update({
        where: { id: existingNote.id },
        data: {
          content: data.content,
          attachments: JSON.stringify(data.attachments || []),
          status: 'draft',
          participantId: data.participantId,
        },
      });
      return updated;
    }

    return this.prisma.dailyNote.create({
      data: {
        tenantId,
        employeeId,
        date: dateStart,
        content: data.content,
        attachments: JSON.stringify(data.attachments || []),
        status: 'draft',
        participantId: data.participantId,
      },
    });
  }

  async submitNote(tenantId: string, userId: string, id: string, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== note.employeeId) {
      throw new ForbiddenException('Cannot submit other employees\' notes');
    }

    if (note.status === 'locked') {
      throw new ForbiddenException('Cannot submit locked note');
    }

    const updated = await this.prisma.dailyNote.update({
      where: { id },
      data: { status: 'submitted' },
    });

    await this.logAudit(tenantId, userId, 'SUBMIT_DAILY_NOTE', 'DailyNote', id);

    return updated;
  }

  async getNotes(tenantId: string, userId: string, params: {
    employeeId?: string;
    status?: string;
    participantId?: string;
    startDate?: Date;
    endDate?: Date;
  }, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const where: any = this.filterByAccess(userContext, { tenantId });
    
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.participantId) where.participantId = params.participantId;
    if (params.startDate && params.endDate) {
      where.date = { gte: params.startDate, lte: params.endDate };
    }

    return this.prisma.dailyNote.findMany({
      where,
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getNote(tenantId: string, id: string, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          include: { user: true },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== note.employeeId) {
      throw new ForbiddenException('Cannot view other employees\' notes');
    }

    return note;
  }

  async reviewNote(tenantId: string, userId: string, id: string, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.status !== 'submitted') {
      throw new ForbiddenException('Can only review submitted notes');
    }

    const updated = await this.prisma.dailyNote.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    });

    await this.logAudit(tenantId, userId, 'REVIEW_DAILY_NOTE', 'DailyNote', id);

    return updated;
  }

  async lockNote(tenantId: string, userId: string, id: string, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.status === 'locked') {
      throw new ForbiddenException('Note is already locked');
    }

    const updated = await this.prisma.dailyNote.update({
      where: { id },
      data: {
        status: 'locked',
        lockedAt: new Date(),
        lockedBy: userId,
      },
    });

    await this.logAudit(tenantId, userId, 'LOCK_DAILY_NOTE', 'DailyNote', id, {
      lockedAt: new Date(),
    });

    return updated;
  }

  async exportNotes(tenantId: string, userId: string, startDate: Date, endDate: Date, 
    params?: { participantId?: string }, userContext?: UserContext) {
    if (userContext && !this.canAccessNotes(userContext)) {
      throw new ForbiddenException('HR role cannot access Daily Notes');
    }

    const where: any = {
      tenantId,
      status: 'locked',
      date: { gte: startDate, lte: endDate },
    };

    if (params?.participantId) {
      where.participantId = params.participantId;
    }

    if (userContext?.role === 'employee' && userContext.employeeId) {
      where.employeeId = userContext.employeeId;
    }

    const notes = await this.prisma.dailyNote.findMany({
      where,
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const exportData = notes.map(note => ({
      noteId: note.id,
      date: note.date,
      content: note.content,
      participantId: note.participantId,
      attachments: JSON.parse(note.attachments || '[]'),
      author: {
        id: note.employeeId,
        name: `${note.employee.user.firstName} ${note.employee.user.lastName}`,
      },
      reviewedAt: note.reviewedAt,
      reviewedBy: note.reviewedBy,
      lockedAt: note.lockedAt,
      lockedBy: note.lockedBy,
    }));

    await this.logAudit(tenantId, userId, 'EXPORT_DAILY_NOTES', 'DailyNote', undefined, {
      startDate,
      endDate,
      notesCount: notes.length,
    });

    return {
      startDate,
      endDate,
      exportDate: new Date(),
      notesCount: notes.length,
      data: exportData,
    };
  }
}
