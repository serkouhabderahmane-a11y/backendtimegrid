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
exports.DailyNotesService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let DailyNotesService = class DailyNotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAudit(tenantId, userId, action, entityType, entityId, metadata) {
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
    async createNote(tenantId, userId, employeeId, data) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
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
                throw new common_1.ForbiddenException('Cannot edit locked note');
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
    async submitNote(tenantId, userId, id) {
        const note = await this.prisma.dailyNote.findFirst({
            where: { id, tenantId },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.status === 'locked') {
            throw new common_1.ForbiddenException('Cannot submit locked note');
        }
        const updated = await this.prisma.dailyNote.update({
            where: { id },
            data: { status: 'submitted' },
        });
        await this.logAudit(tenantId, userId, 'SUBMIT_DAILY_NOTE', 'DailyNote', id);
        return updated;
    }
    async getNotes(tenantId, employeeId, status) {
        const where = { tenantId };
        if (employeeId)
            where.employeeId = employeeId;
        if (status)
            where.status = status;
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
    async getNote(tenantId, id) {
        const note = await this.prisma.dailyNote.findFirst({
            where: { id, tenantId },
            include: {
                employee: {
                    include: { user: true },
                },
            },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        return note;
    }
    async reviewNote(tenantId, userId, id) {
        const note = await this.prisma.dailyNote.findFirst({
            where: { id, tenantId },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.status !== 'submitted') {
            throw new common_1.ForbiddenException('Can only review submitted notes');
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
    async lockNote(tenantId, userId, id) {
        const note = await this.prisma.dailyNote.findFirst({
            where: { id, tenantId },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.status === 'locked') {
            throw new common_1.ForbiddenException('Note is already locked');
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
    async exportNotes(tenantId, userId, startDate, endDate) {
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
};
exports.DailyNotesService = DailyNotesService;
exports.DailyNotesService = DailyNotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], DailyNotesService);
//# sourceMappingURL=daily-notes.service.js.map