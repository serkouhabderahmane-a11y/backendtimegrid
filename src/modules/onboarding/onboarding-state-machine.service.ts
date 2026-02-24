import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';

const ONBOARDING_STATE_ORDER = [
  'candidate_created',
  'packet_assigned',
  'in_progress',
  'pending_hr_review',
  'approved',
  'employee_active',
];

@Injectable()
export class OnboardingStateMachine {
  private readonly logger = new Logger(OnboardingStateMachine.name);

  constructor(
    private prisma: PrismaService,
    private auditLogger: AuditLogger,
  ) {}

  async transitionToState(
    onboardingId: string,
    targetState: string,
    userId?: string,
    metadata?: Record<string, any>,
  ) {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: { candidate: true, taskStatuses: true },
    });

    if (!onboarding) {
      throw new BadRequestException('Onboarding record not found');
    }

    const currentState = onboarding.currentState;
    const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(currentState);
    const targetStateIndex = ONBOARDING_STATE_ORDER.indexOf(targetState);

    if (targetStateIndex === -1) {
      throw new BadRequestException(`Invalid target state: ${targetState}`);
    }

    if (targetStateIndex !== currentStateIndex + 1) {
      throw new ForbiddenException(
        `Cannot transition from ${currentState} to ${targetState}. Must progress through states in order.`,
      );
    }

    const oldState = currentState;
    const newState = targetState;

    let updatedOnboarding;

    if (newState === 'employee_active') {
      updatedOnboarding = await this.activateEmployee(onboarding, userId);
    } else {
      updatedOnboarding = await this.prisma.employeeOnboarding.update({
        where: { id: onboardingId },
        data: {
          currentState: newState as any,
          updatedAt: new Date(),
        },
      });
    }

    await this.auditLogger.logStateTransition(
      onboarding.tenantId,
      userId,
      'EmployeeOnboarding',
      onboardingId,
      oldState,
      newState,
      metadata,
    );

    await this.prisma.candidate.update({
      where: { id: onboarding.candidateId },
      data: { state: newState as any },
    });

    return updatedOnboarding;
  }

  private async activateEmployee(
    onboarding: any,
    userId?: string,
  ) {
    const candidate = onboarding.candidate;

    const passwordHash = await this.generateTempPassword();

    const user = await this.prisma.user.create({
      data: {
        tenantId: onboarding.tenantId,
        email: candidate.email,
        passwordHash,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        role: 'employee',
      },
    });

    const employee = await this.prisma.employee.create({
      data: {
        userId: user.id,
        tenantId: onboarding.tenantId,
        departmentId: candidate.departmentId,
        locationId: candidate.locationId,
        startDate: candidate.startDate,
        onboardingStatus: 'employee_active',
        canClockIn: true,
      },
    });

    const updatedOnboarding = await this.prisma.employeeOnboarding.update({
      where: { id: onboarding.id },
      data: {
        currentState: 'employee_active',
        activatedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return updatedOnboarding;
  }

  private async generateTempPassword(): Promise<string> {
    const bcrypt = require('bcryptjs');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return bcrypt.hash(password, 12);
  }

  async canTransitionTo(onboardingId: string, targetState: string): Promise<boolean> {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
    });

    if (!onboarding) {
      return false;
    }

    const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(onboarding.currentState);
    const targetStateIndex = ONBOARDING_STATE_ORDER.indexOf(targetState);

    return targetStateIndex === currentStateIndex + 1;
  }

  async getNextState(currentState: string): Promise<string | null> {
    const currentStateIndex = ONBOARDING_STATE_ORDER.indexOf(currentState);
    if (currentStateIndex === -1 || currentStateIndex >= ONBOARDING_STATE_ORDER.length - 1) {
      return null;
    }
    return ONBOARDING_STATE_ORDER[currentStateIndex + 1];
  }

  async calculateProgress(onboardingId: string): Promise<number> {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: {
        taskStatuses: {
          include: { task: true },
        },
      },
    });

    if (!onboarding || onboarding.taskStatuses.length === 0) {
      return 0;
    }

    const totalTasks = onboarding.taskStatuses.length;
    const completedTasks = onboarding.taskStatuses.filter(
      (ts) => ts.status === 'approved',
    ).length;

    return Math.round((completedTasks / totalTasks) * 100);
  }

  async areAllRequiredTasksApproved(onboardingId: string): Promise<boolean> {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: {
        taskStatuses: {
          include: { task: true },
        },
      },
    });

    if (!onboarding) {
      return false;
    }

    const requiredTasks = onboarding.taskStatuses.filter((ts) => ts.task.isRequired);
    const allApproved = requiredTasks.every((ts) => ts.status === 'approved');

    return allApproved;
  }
}
