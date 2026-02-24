import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { OnboardingStateMachine } from '../onboarding/onboarding-state-machine.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private auditLogger: AuditLogger,
    private stateMachine: OnboardingStateMachine,
    private emailService: EmailService,
  ) {}

  async create(tenantId: string, dto: CreateCandidateDto, userId?: string) {
    console.log('Creating candidate with data:', dto);
    
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });

    if (existingCandidate) {
      throw new BadRequestException('Candidate with this email already exists');
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
          employmentType: dto.employmentType as any,
          startDate: new Date(dto.startDate),
          state: 'candidate_created',
        },
      });

      await this.auditLogger.logCreate(
        tenantId,
        userId,
        'Candidate',
        candidate.id,
        {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          position: candidate.position,
          state: candidate.state,
        },
      );

      return candidate;
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }

  async findAll(tenantId: string, filters?: { state?: string; search?: string }) {
    const where: any = { tenantId };

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

  async findOne(tenantId: string, candidateId: string) {
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
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async assignPacket(
    tenantId: string,
    candidateId: string,
    packetId: string,
    userId?: string,
  ) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.state !== 'candidate_created') {
      throw new BadRequestException('Candidate must be in candidate_created state to assign packet');
    }

    const packet = await this.prisma.onboardingPacket.findFirst({
      where: { id: packetId, tenantId },
    });

    if (!packet) {
      throw new NotFoundException('Onboarding packet not found');
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

    await this.auditLogger.logStateTransition(
      tenantId,
      userId,
      'Candidate',
      candidateId,
      'candidate_created',
      'packet_assigned',
      { onboardingId: onboarding.id, packetId },
    );

    await this.emailService.sendOnboardingInvitation(candidate, secureToken);

    return onboarding;
  }

  private generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}
