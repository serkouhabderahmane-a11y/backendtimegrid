import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

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

  async createNote(tenantId: string, userId: string, employeeId: string, data: {
    date: Date;
    content: string;
    attachments?: string[];
  }) {
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
      },
    });
  }

  async submitNote(tenantId: string, userId: string, id: string) {
    const note = await this.prisma.dailyNote.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
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

  async getNotes(tenantId: string, employeeId?: string, status?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

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

  async getNote(tenantId: string, id: string) {
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

    return note;
  }

  async reviewNote(tenantId: string, userId: string, id: string) {
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

  async lockNote(tenantId: string, userId: string, id: string) {
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

  async exportNotes(tenantId: string, userId: string, startDate: Date, endDate: Date) {
    const notes = await this.prisma.dailyNote.findMany({
      where: {
        tenantId,
        status: 'locked',
        date: { gte: startDate, lte: endDate },
      },
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
