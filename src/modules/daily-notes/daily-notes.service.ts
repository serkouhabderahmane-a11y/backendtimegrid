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
    const allowedRoles = ['admin', 'manager', 'supervisor', 'employee'];
    return allowedRoles.includes(userContext.role);
  }

  private canEditNote(userContext: UserContext): boolean {
    const editorRoles = ['admin', 'manager', 'supervisor'];
    return editorRoles.includes(userContext.role);
  }

  private filterByAccess(userContext: UserContext, baseWhere: any): any {
    if (userContext.role === 'employee' && userContext.employeeId) {
      return { ...baseWhere, employeeId: userContext.employeeId };
    }
    return baseWhere;
  }

  private canReviewOrLock(userContext: UserContext): boolean {
    const reviewerRoles = ['admin', 'manager', 'supervisor'];
    return reviewerRoles.includes(userContext.role);
  }

  async createNote(tenantId: string, userId: string, employeeId: string, data: {
    date: Date;
    content: string;
    attachments?: string[];
    participantId?: string;
  }, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('You do not have permission to access Daily Notes');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== employeeId) {
      throw new ForbiddenException('Employees can only create notes for themselves');
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
      if (userContext.role === 'employee' && existingNote.employeeId !== userContext.employeeId) {
        throw new ForbiddenException('You can only edit your own notes');
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
      await this.logAudit(tenantId, userId, 'EDIT_DAILY_NOTE', 'DailyNote', existingNote.id, {
        editedBy: userContext.role,
      });
      return updated;
    }

    const created = await this.prisma.dailyNote.create({
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

    await this.logAudit(tenantId, userId, 'CREATE_DAILY_NOTE', 'DailyNote', created.id);

    return created;
  }

  async submitNote(tenantId: string, userId: string, id: string, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('You do not have permission to access Daily Notes');
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

  async updateNote(tenantId: string, userId: string, id: string, data: {
    content?: string;
    date?: Date;
    participantId?: string;
    attachments?: string[];
  }, userContext: UserContext) {
    if (!this.canAccessNotes(userContext)) {
      throw new ForbiddenException('You do not have permission to access Daily Notes');
    }

    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.status === 'locked') {
      throw new ForbiddenException('Cannot edit locked note');
    }

    if (userContext.role === 'employee' && userContext.employeeId !== note.employeeId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.participantId !== undefined) updateData.participantId = data.participantId;
    if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments);
    if (data.date !== undefined) {
      const dateStart = new Date(data.date);
      dateStart.setHours(0, 0, 0, 0);
      updateData.date = dateStart;
    }

    const updated = await this.prisma.dailyNote.update({
      where: { id },
      data: updateData,
    });

    await this.logAudit(tenantId, userId, 'UPDATE_DAILY_NOTE', 'DailyNote', id, {
      editedBy: userContext.role,
    });

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
    if (!this.canReviewOrLock(userContext)) {
      throw new ForbiddenException('You do not have permission to review notes');
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
    if (!this.canReviewOrLock(userContext)) {
      throw new ForbiddenException('You do not have permission to lock notes');
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
      throw new ForbiddenException('You do not have permission to export Daily Notes');
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
      participantId: params?.participantId,
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
