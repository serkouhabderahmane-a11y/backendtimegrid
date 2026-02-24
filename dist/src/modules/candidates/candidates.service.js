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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const audit_logger_service_1 = require("../../modules/audit-logs/audit-logger.service");
const onboarding_state_machine_service_1 = require("../onboarding/onboarding-state-machine.service");
const email_service_1 = require("../email/email.service");
let CandidatesService = class CandidatesService {
    prisma;
    auditLogger;
    stateMachine;
    emailService;
    constructor(prisma, auditLogger, stateMachine, emailService) {
        this.prisma = prisma;
        this.auditLogger = auditLogger;
        this.stateMachine = stateMachine;
        this.emailService = emailService;
    }
    async create(tenantId, dto, userId) {
        console.log('Creating candidate with data:', dto);
        const existingCandidate = await this.prisma.candidate.findUnique({
            where: { tenantId_email: { tenantId, email: dto.email } },
        });
        if (existingCandidate) {
            throw new common_1.BadRequestException('Candidate with this email already exists');
        }
        try {
            const candidate = await this.prisma.candidate.create({
                data: {
                    tenantId,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    phone: dto.phone,
                    position: dto.position,
                    locationId: dto.locationId,
                    departmentId: dto.departmentId,
                    employmentType: dto.employmentType,
                    startDate: new Date(dto.startDate),
                    state: 'candidate_created',
                },
            });
            await this.auditLogger.logCreate(tenantId, userId, 'Candidate', candidate.id, {
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                email: candidate.email,
                position: candidate.position,
                state: candidate.state,
            });
            return candidate;
        }
        catch (error) {
            console.error('Error creating candidate:', error);
            throw error;
        }
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.state) {
            where.state = filters.state;
        }
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search } },
                { lastName: { contains: filters.search } },
                { email: { contains: filters.search } },
                { position: { contains: filters.search } },
            ];
        }
        const candidates = await this.prisma.candidate.findMany({
            where,
            include: {
                location: true,
                department: true,
                onboarding: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return candidates;
    }
    async findOne(tenantId, candidateId) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: candidateId, tenantId },
            include: {
                location: true,
                department: true,
                onboarding: {
                    include: {
                        packet: true,
                        taskStatuses: {
                            include: { task: true },
                        },
                    },
                },
                documents: true,
            },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        return candidate;
    }
    async assignPacket(tenantId, candidateId, packetId, userId) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: candidateId, tenantId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.state !== 'candidate_created') {
            throw new common_1.BadRequestException('Candidate must be in candidate_created state to assign packet');
        }
        const packet = await this.prisma.onboardingPacket.findFirst({
            where: { id: packetId, tenantId },
        });
        if (!packet) {
            throw new common_1.NotFoundException('Onboarding packet not found');
        }
        const secureToken = this.generateSecureToken();
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);
        const onboarding = await this.prisma.employeeOnboarding.create({
            data: {
                candidateId,
                packetId,
                tenantId,
                secureToken,
                tokenExpiresAt,
                currentState: 'packet_assigned',
            },
        });
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: { state: 'packet_assigned' },
        });
        await this.auditLogger.logStateTransition(tenantId, userId, 'Candidate', candidateId, 'candidate_created', 'packet_assigned', { onboardingId: onboarding.id, packetId });
        await this.emailService.sendOnboardingInvitation(candidate, secureToken);
        return onboarding;
    }
    generateSecureToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService,
        audit_logger_service_1.AuditLogger,
        onboarding_state_machine_service_1.OnboardingStateMachine,
        email_service_1.EmailService])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map