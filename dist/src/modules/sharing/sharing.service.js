"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharingService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const crypto = __importStar(require("crypto"));
let SharingService = class SharingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createShareLink(tenantId, userId, entityType, entityId, expiresInHours = 24) {
        const entity = await this.prisma.dailyNote.findFirst({
            where: { id: entityId, tenantId },
        });
        if (!entity) {
            throw new common_1.NotFoundException('Entity not found');
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
    async accessSharedContent(token) {
        const shareLink = await this.prisma.sharedLink.findFirst({
            where: {
                token,
                expiresAt: { gt: new Date() },
            },
        });
        if (!shareLink) {
            throw new common_1.NotFoundException('Share link not found or expired');
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
                throw new common_1.NotFoundException('Note not found');
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
                throw new common_1.NotFoundException('MAR entry not found');
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
        throw new common_1.BadRequestException('Unknown entity type');
    }
    async revokeShareLink(tenantId, userId, token) {
        const shareLink = await this.prisma.sharedLink.findFirst({
            where: { token, tenantId },
        });
        if (!shareLink) {
            throw new common_1.NotFoundException('Share link not found');
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
    async getActiveShareLinks(tenantId, userId) {
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
};
exports.SharingService = SharingService;
exports.SharingService = SharingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], SharingService);
//# sourceMappingURL=sharing.service.js.map