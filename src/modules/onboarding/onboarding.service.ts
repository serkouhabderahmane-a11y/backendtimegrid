import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import { OnboardingStateMachine } from './onboarding-state-machine.service';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private stateMachine: OnboardingStateMachine,
    private auditLogger: AuditLogger,
    private emailService: EmailService,
  ) {}

  async getOnboardingByToken(secureToken: string) {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { secureToken },
      include: {
        candidate: true,
        packet: true,
        taskStatuses: {
          include: { task: true },
          orderBy: { task: { order: 'asc' } },
        },
      },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    if (onboarding.tokenExpiresAt < new Date()) {
      throw new ForbiddenException('Onboarding link has expired');
    }

    const progress = await this.stateMachine.calculateProgress(onboarding.id);

    return {
      ...onboarding,
      progressPercent: progress,
    };
  }

  async getTask(onboardingId: string, taskId: string, tenantId: string) {
    const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
      where: {
        onboardingId,
        taskId,
        onboarding: { tenantId },
      },
      include: { task: true, onboarding: { include: { candidate: true } } },
    });

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    return taskStatus;
  }

  async saveTaskDraft(
    onboardingId: string,
    taskId: string,
    tenantId: string,
    submissionData: Record<string, any>,
  ) {
    const onboarding = await this.prisma.employeeOnboarding.findFirst({
      where: { id: onboardingId, tenantId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    if (onboarding.currentState === 'employee_active') {
      throw new BadRequestException('Onboarding already completed');
    }

    const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
      where: { onboardingId_taskId: { onboardingId, taskId } },
      create: {
        onboardingId,
        taskId,
        status: 'draft',
        submissionData: JSON.stringify(submissionData),
      },
      update: {
        submissionData: JSON.stringify(submissionData),
      },
    });

    return taskStatus;
  }

  async submitTask(
    onboardingId: string,
    taskId: string,
    tenantId: string,
    submissionData: Record<string, any>,
  ) {
    const onboarding = await this.prisma.employeeOnboarding.findFirst({
      where: { id: onboardingId, tenantId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    if (onboarding.currentState === 'employee_active') {
      throw new BadRequestException('Onboarding already completed');
    }

    const task = await this.prisma.onboardingTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
      where: { onboardingId_taskId: { onboardingId, taskId } },
      create: {
        onboardingId,
        taskId,
        status: 'submitted',
        submissionData: JSON.stringify(submissionData),
        submittedAt: new Date(),
      },
      update: {
        status: 'submitted',
        submissionData: JSON.stringify(submissionData),
        submittedAt: new Date(),
      },
    });

    await this.auditLogger.log({
      tenantId,
      action: 'TASK_SUBMITTED',
      entityType: 'EmployeeOnboardingTaskStatus',
      entityId: taskStatus.id,
      metadata: { taskId, taskName: task.name, taskType: task.type },
    });

    await this.checkAndAdvanceState(onboardingId, tenantId);

    return taskStatus;
  }

  async approveTask(
    onboardingId: string,
    taskId: string,
    tenantId: string,
    userId: string,
    comment?: string,
  ) {
    const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
      where: {
        onboardingId,
        taskId,
        onboarding: { tenantId },
      },
      include: { task: true },
    });

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    if (taskStatus.status !== 'submitted') {
      throw new BadRequestException('Task must be in submitted status to approve');
    }

    const updated = await this.prisma.employeeOnboardingTaskStatus.update({
      where: { id: taskStatus.id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedByUserId: userId,
        reviewComment: comment,
      },
    });

    await this.auditLogger.log({
      tenantId,
      userId,
      action: 'TASK_APPROVED',
      entityType: 'EmployeeOnboardingTaskStatus',
      entityId: taskStatus.id,
      metadata: { taskId, taskName: taskStatus.task.name, comment },
    });

    await this.checkAndAdvanceState(onboardingId, tenantId);

    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: { candidate: true },
    });

    if (onboarding?.candidate) {
      await this.emailService.sendTaskApprovalNotification(
        onboarding.candidate.email,
        taskStatus.task.name,
      );
    }

    return updated;
  }

  async rejectTask(
    onboardingId: string,
    taskId: string,
    tenantId: string,
    userId: string,
    comment: string,
  ) {
    if (!comment) {
      throw new BadRequestException('Rejection comment is required');
    }

    const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
      where: {
        onboardingId,
        taskId,
        onboarding: { tenantId },
      },
      include: { task: true },
    });

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    const updated = await this.prisma.employeeOnboardingTaskStatus.update({
      where: { id: taskStatus.id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedByUserId: userId,
        reviewComment: comment,
      },
    });

    await this.auditLogger.log({
      tenantId,
      userId,
      action: 'TASK_REJECTED',
      entityType: 'EmployeeOnboardingTaskStatus',
      entityId: taskStatus.id,
      metadata: { taskId, taskName: taskStatus.task.name, comment },
    });

    await this.transitionToInProgress(onboardingId, tenantId);

    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: { candidate: true },
    });

    if (onboarding?.candidate) {
      await this.emailService.sendTaskRejectionNotification(
        onboarding.candidate.email,
        taskStatus.task.name,
        comment,
      );
    }

    return updated;
  }

  private async checkAndAdvanceState(onboardingId: string, tenantId: string) {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
      include: { taskStatuses: true },
    });

    if (!onboarding) return;

    const allSubmitted = onboarding.taskStatuses.every(
      (ts) => ts.status === 'submitted' || ts.status === 'approved',
    );

    if (allSubmitted && onboarding.currentState === 'in_progress') {
      await this.stateMachine.transitionToState(onboardingId, 'pending_hr_review');
    }
  }

  private async transitionToInProgress(onboardingId: string, tenantId: string) {
    const onboarding = await this.prisma.employeeOnboarding.findUnique({
      where: { id: onboardingId },
    });

    if (!onboarding) return;

    if (onboarding.currentState === 'in_progress' || onboarding.currentState === 'pending_hr_review') {
      await this.stateMachine.transitionToState(onboardingId, 'in_progress');
    }
  }

  async getProgress(onboardingId: string, tenantId: string) {
    const onboarding = await this.prisma.employeeOnboarding.findFirst({
      where: { id: onboardingId, tenantId },
      include: {
        taskStatuses: { include: { task: true } },
      },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    const progress = await this.stateMachine.calculateProgress(onboardingId);

    const taskBreakdown = onboarding.taskStatuses.map((ts) => ({
      taskId: ts.taskId,
      taskName: ts.task.name,
      taskType: ts.task.type,
      status: ts.status,
      isRequired: ts.task.isRequired,
    }));

    return {
      onboardingId,
      currentState: onboarding.currentState,
      progressPercent: progress,
      tasks: taskBreakdown,
    };
  }
}
