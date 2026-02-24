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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.tenant.findFirst({
            where: {
                OR: [
                    { slug: data.slug },
                    ...(data.domain ? [{ domain: data.domain }] : []),
                ],
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Tenant with this slug or domain already exists');
        }
        return this.prisma.tenant.create({
            data,
        });
    }
    async findByDomain(domain) {
        return this.prisma.tenant.findUnique({
            where: { domain },
        });
    }
    async findBySlug(slug) {
        return this.prisma.tenant.findUnique({
            where: { slug },
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getLocations(tenantId) {
        return this.prisma.location.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getDepartments(tenantId) {
        return this.prisma.department.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getOnboardingPackets(tenantId) {
        return this.prisma.onboardingPacket.findMany({
            where: { tenantId, isActive: true },
            include: { assignments: false },
            orderBy: { name: 'asc' },
        });
    }
    async getOnboardingTasks(tenantId) {
        return this.prisma.onboardingTask.findMany({
            where: { tenantId, isActive: true },
            orderBy: { order: 'asc' },
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map