import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

@Injectable()
export class HrDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const [
      totalCandidates,
      candidatesByState,
      pendingApprovals,
      activeEmployees,
    ] = await Promise.all([
      this.prisma.candidate.count({ where: { tenantId } }),
      this.prisma.candidate.groupBy({
        by: ['state'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.employeeOnboardingTaskStatus.count({
        where: {
          onboarding: { tenantId },
          status: 'submitted',
        },
      }),
      this.prisma.employee.count({
        where: { tenantId, onboardingStatus: 'employee_active' },
      }),
    ]);

    const stateCounts: Record<string, number> = {};
    candidatesByState.forEach((item) => {
      stateCounts[item.state] = item._count;
    });

    return {
      totalCandidates,
      activeEmployees,
      pendingApprovals,
      candidatesByState: stateCounts,
    };
  }

  async getCandidatesByState(tenantId: string, state: string) {
    return this.prisma.candidate.findMany({
      where: { tenantId, state: state as any },
      include: {
        location: true,
        department: true,
        onboarding: {
          include: {
            taskStatuses: { include: { task: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApprovalQueue(tenantId: string) {
    return this.prisma.employeeOnboardingTaskStatus.findMany({
      where: {
        onboarding: { tenantId },
        status: 'submitted',
      },
      include: {
        task: true,
        onboarding: {
          include: { candidate: true },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async getRejectedTasks(tenantId: string) {
    return this.prisma.employeeOnboardingTaskStatus.findMany({
      where: {
        onboarding: { tenantId },
        status: 'rejected',
      },
      include: {
        task: true,
        onboarding: {
          include: { candidate: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getExpiredDocuments(tenantId: string) {
    const now = new Date();
    return this.prisma.document.findMany({
      where: {
        tenantId,
        expiresAt: { lte: now },
      },
      include: { candidate: true },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async getExpiringDocuments(tenantId: string, daysAhead: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.document.findMany({
      where: {
        tenantId,
        expiresAt: {
          gt: now,
          lte: futureDate,
        },
      },
      include: { candidate: true },
      orderBy: { expiresAt: 'asc' },
    });
  }
}
