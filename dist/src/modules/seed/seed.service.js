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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const bcrypt = __importStar(require("bcryptjs"));
let SeedService = class SeedService {
    prisma;
    demoUsers = [
        {
            email: process.env.DEMO_EMAIL || 'demo@timegrid.app',
            password: process.env.DEMO_PASSWORD || 'demo123',
            firstName: 'Demo',
            lastName: 'Admin',
            role: 'admin',
        },
        {
            email: process.env.DEMO_HR_EMAIL || 'hr@timegrid.app',
            password: process.env.DEMO_HR_PASSWORD || 'hr123',
            firstName: 'HR',
            lastName: 'Manager',
            role: 'hr',
        },
        {
            email: process.env.DEMO_EMPLOYEE_EMAIL || 'employee@timegrid.app',
            password: process.env.DEMO_EMPLOYEE_PASSWORD || 'employee123',
            firstName: 'John',
            lastName: 'Employee',
            role: 'employee',
        },
    ];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedDemoUsers() {
        console.log('[Seed] Starting demo user seeding...');
        let tenant = await this.prisma.tenant.findFirst({
            where: { slug: 'demo-tenant' },
        });
        if (!tenant) {
            tenant = await this.prisma.tenant.create({
                data: {
                    name: 'Demo Organization',
                    slug: 'demo-tenant',
                    settings: JSON.stringify({
                        overtimeThreshold: 480,
                        overtimeMultiplier: 1.5,
                        defaultPayRate: 15,
                    }),
                },
            });
            console.log('[Seed] Created demo tenant');
        }
        for (const demoUser of this.demoUsers) {
            try {
                const existingUser = await this.prisma.user.findFirst({
                    where: {
                        tenantId: tenant.id,
                        email: demoUser.email
                    },
                });
                if (existingUser) {
                    console.log(`[Seed] User ${demoUser.email} already exists, skipping...`);
                    continue;
                }
                const hashedPassword = await bcrypt.hash(demoUser.password, 10);
                const user = await this.prisma.user.create({
                    data: {
                        tenantId: tenant.id,
                        email: demoUser.email,
                        passwordHash: hashedPassword,
                        firstName: demoUser.firstName,
                        lastName: demoUser.lastName,
                        role: demoUser.role,
                        isActive: true,
                    },
                });
                await this.prisma.employee.create({
                    data: {
                        userId: user.id,
                        tenantId: tenant.id,
                        employeeNumber: `EMP-${Date.now()}`,
                        startDate: new Date(),
                        canClockIn: true,
                        onboardingStatus: 'employee_active',
                    },
                });
                console.log(`[Seed] Created user: ${demoUser.email} (${demoUser.role})`);
            }
            catch (error) {
                console.error(`[Seed] Error creating user ${demoUser.email}:`, error.message);
            }
        }
        console.log('[Seed] Demo user seeding completed');
    }
    async getDemoCredentials() {
        return this.demoUsers.map(({ password, ...rest }) => ({
            ...rest,
            note: 'Use the password from environment variables or default passwords',
        }));
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService])
], SeedService);
//# sourceMappingURL=seed.service.js.map