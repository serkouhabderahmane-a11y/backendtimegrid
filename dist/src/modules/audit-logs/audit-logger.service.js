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
var AuditLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let AuditLogger = AuditLogger_1 = class AuditLogger {
    prisma;
    logger = new common_1.Logger(AuditLogger_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
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
        }
        catch (error) {
            this.logger.error(`Failed to write audit log: ${error.message}`, error.stack);
        }
    }
    async logStateTransition(tenantId, userId, entityType, entityId, oldState, newState, metadata) {
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
    async logCreate(tenantId, userId, entityType, entityId, values) {
        await this.log({
            tenantId,
            userId,
            action: 'CREATE',
            entityType,
            entityId,
            newValues: values,
        });
    }
    async logUpdate(tenantId, userId, entityType, entityId, oldValues, newValues) {
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
    async logDelete(tenantId, userId, entityType, entityId, oldValues) {
        await this.log({
            tenantId,
            userId,
            action: 'DELETE',
            entityType,
            entityId,
            oldValues,
        });
    }
};
exports.AuditLogger = AuditLogger;
exports.AuditLogger = AuditLogger = AuditLogger_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], AuditLogger);
//# sourceMappingURL=audit-logger.service.js.map