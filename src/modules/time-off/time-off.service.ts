import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import {
  CreateTimeOffRequestDto,
  UpdateTimeOffRequestDto,
  ReviewTimeOffDto,
  CancelTimeOffDto,
  TimeOffQueryDto,
  CreateBalanceDto,
  UpdateBalanceDto,
  AdjustBalanceDto,
} from './dto/time-off.dto';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  private getClientIp(request: any): string {
    return request?.ip || request?.connection?.remoteAddress || request?.headers?.['x-forwarded-for'] || 'unknown';
  }

  private calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private async createLog(
    timeOffRequestId: string | null,
    balanceId: string | null,
    employeeId: string,
    tenantId: string,
    action: string,
    performedBy: string,
    request: any,
    previousValues?: string,
    newValues?: string,
    reason?: string,
  ): Promise<void> {
    await this.prisma.timeOffLog.create({
      data: {
        timeOffRequestId,
        balanceId,
        employeeId,
        tenantId,
        action,
        performedBy,
        previousValues,
        newValues,
        reason,
        ipAddress: this.getClientIp(request),
        userAgent: request?.headers?.['user-agent'],
      },
    });
  }

  private async createAuditLog(
    tenantId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  async createRequest(userId: string, tenantId: string, dto: CreateTimeOffRequestDto, request: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee record not found');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Cannot create request for past dates');
    }

    const conflictingRequest = await this.prisma.timeOffRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['pending', 'approved'] },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (conflictingRequest) {
      throw new BadRequestException('You already have a time-off request for this period');
    }

    const isHolidayWork = await this.checkHolidayOverlap(tenantId, startDate, endDate, employee.departmentId ?? undefined, employee.locationId ?? undefined);

    const totalDays = this.calculateBusinessDays(startDate, endDate);

    if (dto.type !== 'unpaid' && dto.type !== 'other') {
      const balance = await this.getOrCreateBalance(employee.id, tenantId, dto.type, startDate.getFullYear());

      const availableDays = balance.totalDays + balance.carryOverDays - balance.usedDays - balance.pendingDays;

      if (totalDays > availableDays) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${availableDays} days, Requested: ${totalDays} days`,
        );
      }

      await this.prisma.timeOffBalance.update({
        where: { id: balance.id },
        data: { pendingDays: balance.pendingDays + totalDays },
      });
    }

    const timeOffRequest = await this.prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        tenantId,
        type: dto.type,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
        status: 'pending',
      },
      include: {
        employee: {
          include: { user: true },
        },
      },
    });

    await this.createLog(
      timeOffRequest.id,
      null,
      employee.id,
      tenantId,
      'CREATE_REQUEST',
      userId,
      request,
    );
    await this.createAuditLog(tenantId, userId, 'CREATE_TIME_OFF_REQUEST', 'TimeOffRequest', timeOffRequest.id, {
      type: dto.type,
      totalDays,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return timeOffRequest;
  }

  async getMyRequests(userId: string, tenantId: string, query: TimeOffQueryDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      return [];
    }

    const where: any = { employeeId: employee.id };

    if (query.startDate && query.endDate) {
      where.startDate = { gte: new Date(query.startDate) };
      where.endDate = { lte: new Date(query.endDate) };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.timeOffRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
    });
  }

  async getMyBalances(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      return [];
    }

    const currentYear = new Date().getFullYear();

    return this.prisma.timeOffBalance.findMany({
      where: { employeeId: employee.id, year: currentYear },
    });
  }

  async reviewRequest(
    tenantId: string,
    requestId: string,
    dto: ReviewTimeOffDto,
    userId: string,
    request: any,
  ) {
    const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
      where: { id: requestId, tenantId },
      include: { employee: true },
    });

    if (!timeOffRequest) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOffRequest.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be reviewed');
    }

    if (dto.status === 'approved') {
      if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
        const balance = await this.prisma.timeOffBalance.findFirst({
          where: {
            employeeId: timeOffRequest.employeeId,
            type: timeOffRequest.type,
            year: timeOffRequest.startDate.getFullYear(),
          },
        });

        if (balance) {
          await this.prisma.timeOffBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: balance.usedDays + timeOffRequest.totalDays,
              pendingDays: balance.pendingDays - timeOffRequest.totalDays,
            },
          });
        }
      }
    } else if (dto.status === 'rejected') {
      if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
        const balance = await this.prisma.timeOffBalance.findFirst({
          where: {
            employeeId: timeOffRequest.employeeId,
            type: timeOffRequest.type,
            year: timeOffRequest.startDate.getFullYear(),
          },
        });

        if (balance) {
          await this.prisma.timeOffBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: Math.max(0, balance.pendingDays - timeOffRequest.totalDays),
            },
          });
        }
      }
    }

    const updated = await this.prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewComment: dto.comment,
      },
      include: {
        employee: {
          include: { user: true },
        },
      },
    });

    await this.createLog(
      requestId,
      null,
      timeOffRequest.employeeId,
      tenantId,
      `REVIEW_${dto.status.toUpperCase()}`,
      userId,
      request,
      JSON.stringify({ previousStatus: 'pending' }),
      JSON.stringify({ newStatus: dto.status, comment: dto.comment }),
    );
    await this.createAuditLog(tenantId, userId, `TIME_OFF_${dto.status.toUpperCase()}`, 'TimeOffRequest', requestId, {
      reviewedBy: userId,
      comment: dto.comment,
    });

    return updated;
  }

  async cancelMyRequest(userId: string, tenantId: string, requestId: string, dto: CancelTimeOffDto, request: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee record not found');
    }

    const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
      where: { id: requestId, employeeId: employee.id },
    });

    if (!timeOffRequest) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOffRequest.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be canceled');
    }

    if (timeOffRequest.type !== 'unpaid' && timeOffRequest.type !== 'other') {
      const balance = await this.prisma.timeOffBalance.findFirst({
        where: {
          employeeId: employee.id,
          type: timeOffRequest.type,
          year: timeOffRequest.startDate.getFullYear(),
        },
      });

      if (balance) {
        await this.prisma.timeOffBalance.update({
          where: { id: balance.id },
          data: {
            pendingDays: Math.max(0, balance.pendingDays - timeOffRequest.totalDays),
          },
        });
      }
    }

    const updated = await this.prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: 'canceled',
      },
    });

    await this.createLog(
      requestId,
      null,
      employee.id,
      tenantId,
      'CANCEL_REQUEST',
      userId,
      request,
      JSON.stringify({ previousStatus: 'pending' }),
      JSON.stringify({ newStatus: 'canceled', reason: dto.reason }),
    );
    await this.createAuditLog(tenantId, userId, 'TIME_OFF_CANCELED', 'TimeOffRequest', requestId);

    return updated;
  }

  async getAdminRequests(tenantId: string, query: TimeOffQueryDto) {
    const where: any = { tenantId };

    if (query.startDate && query.endDate) {
      where.startDate = { gte: new Date(query.startDate) };
      where.endDate = { lte: new Date(query.endDate) };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    const [requests, total] = await Promise.all([
      this.prisma.timeOffRequest.findMany({
        where,
        include: {
          employee: {
            include: {
              user: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 50,
        skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
      }),
      this.prisma.timeOffRequest.count({ where }),
    ]);

    return {
      data: requests,
      total,
      page: query.page || 1,
      limit: query.limit || 50,
      totalPages: Math.ceil(total / (query.limit || 50)),
    };
  }

  async getLeaveCalendar(tenantId: string, query: TimeOffQueryDto) {
    const where: any = {
      tenantId,
      status: 'approved',
    };

    if (query.startDate && query.endDate) {
      where.startDate = { gte: new Date(query.startDate) };
      where.endDate = { lte: new Date(query.endDate) };
    }

    const requests = await this.prisma.timeOffRequest.findMany({
      where,
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return requests.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
      type: r.type,
      startDate: r.startDate,
      endDate: r.endDate,
      totalDays: r.totalDays,
    }));
  }

  async getEmployeeBalances(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const currentYear = new Date().getFullYear();

    return this.prisma.timeOffBalance.findMany({
      where: { employeeId, year: currentYear },
    });
  }

  async createOrUpdateBalance(
    tenantId: string,
    employeeId: string,
    dto: CreateBalanceDto,
    userId: string,
    request: any,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existing = await this.prisma.timeOffBalance.findFirst({
      where: { employeeId, type: dto.type, year: dto.year },
    });

    let balance;
    if (existing) {
      balance = await this.prisma.timeOffBalance.update({
        where: { id: existing.id },
        data: {
          totalDays: dto.totalDays,
          carryOverDays: dto.carryOverDays || 0,
        },
      });
    } else {
      balance = await this.prisma.timeOffBalance.create({
        data: {
          employeeId,
          tenantId,
          type: dto.type,
          year: dto.year,
          totalDays: dto.totalDays,
          carryOverDays: dto.carryOverDays || 0,
          usedDays: 0,
          pendingDays: 0,
        },
      });
    }

    await this.createLog(
      null,
      balance.id,
      employeeId,
      tenantId,
      existing ? 'UPDATE_BALANCE' : 'CREATE_BALANCE',
      userId,
      request,
    );
    await this.createAuditLog(tenantId, userId, 'SET_BALANCE', 'TimeOffBalance', balance.id, {
      type: dto.type,
      year: dto.year,
      totalDays: dto.totalDays,
    });

    return balance;
  }

  async adjustBalance(
    tenantId: string,
    balanceId: string,
    dto: AdjustBalanceDto,
    userId: string,
    request: any,
  ) {
    const balance = await this.prisma.timeOffBalance.findFirst({
      where: { id: balanceId, tenantId },
    });

    if (!balance) {
      throw new NotFoundException('Balance record not found');
    }

    if (!dto.reason || dto.reason.trim().length < 5) {
      throw new BadRequestException('Reason is required for balance adjustment');
    }

    const previousValues = JSON.stringify({
      totalDays: balance.totalDays,
      usedDays: balance.usedDays,
      carryOverDays: balance.carryOverDays,
    });

    const updated = await this.prisma.timeOffBalance.update({
      where: { id: balanceId },
      data: {
        totalDays: dto.totalDays,
        usedDays: dto.usedDays !== undefined ? dto.usedDays : balance.usedDays,
        carryOverDays: dto.carryOverDays !== undefined ? dto.carryOverDays : balance.carryOverDays,
      },
    });

    await this.createLog(
      null,
      balanceId,
      balance.employeeId,
      tenantId,
      'ADJUST_BALANCE',
      userId,
      request,
      previousValues,
      JSON.stringify({
        totalDays: dto.totalDays,
        usedDays: dto.usedDays,
        carryOverDays: dto.carryOverDays,
      }),
      dto.reason,
    );
    await this.createAuditLog(tenantId, userId, 'ADJUST_BALANCE', 'TimeOffBalance', balanceId, {
      previousValues,
      newValues: { totalDays: dto.totalDays, usedDays: dto.usedDays, carryOverDays: dto.carryOverDays },
      reason: dto.reason,
    });

    return updated;
  }

  async getRequestLogs(tenantId: string, requestId: string) {
    const timeOffRequest = await this.prisma.timeOffRequest.findFirst({
      where: { id: requestId, tenantId },
    });

    if (!timeOffRequest) {
      throw new NotFoundException('Time-off request not found');
    }

    return this.prisma.timeOffLog.findMany({
      where: { timeOffRequestId: requestId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async getBalanceHistory(tenantId: string, balanceId: string) {
    const balance = await this.prisma.timeOffBalance.findFirst({
      where: { id: balanceId, tenantId },
    });

    if (!balance) {
      throw new NotFoundException('Balance record not found');
    }

    return this.prisma.timeOffLog.findMany({
      where: { balanceId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async getAdminStats(tenantId: string, query: TimeOffQueryDto) {
    const where: any = { tenantId };

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [pending, approved, rejected, canceled, byType] = await Promise.all([
      this.prisma.timeOffRequest.count({ where: { ...where, status: 'pending' } }),
      this.prisma.timeOffRequest.count({ where: { ...where, status: 'approved' } }),
      this.prisma.timeOffRequest.count({ where: { ...where, status: 'rejected' } }),
      this.prisma.timeOffRequest.count({ where: { ...where, status: 'canceled' } }),
      this.prisma.timeOffRequest.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      canceled,
      total: pending + approved + rejected + canceled,
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
      })),
    };
  }

  private async getOrCreateBalance(employeeId: string, tenantId: string, type: any, year: number) {
    let balance = await this.prisma.timeOffBalance.findFirst({
      where: { employeeId, type, year },
    });

    if (!balance) {
      const defaultDays = type === 'annual' ? 15 : type === 'sick' ? 10 : 0;

      balance = await this.prisma.timeOffBalance.create({
        data: {
          employeeId,
          tenantId,
          type,
          year,
          totalDays: defaultDays,
          usedDays: 0,
          pendingDays: 0,
          carryOverDays: 0,
        },
      });
    }

    return balance;
  }

  private async checkHolidayOverlap(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    locationId?: string,
  ): Promise<boolean> {
    const holidays = await this.prisma.holiday.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          {
            AND: [
              { date: { lte: endDate } },
              { OR: [{ endDate: { gte: startDate } }, { endDate: null }] },
            ],
          },
        ],
      },
    });

    return holidays.length > 0;
  }

  async getAllEmployees(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, onboardingStatus: 'employee_active' },
      include: { user: true, department: true },
      orderBy: { user: { lastName: 'asc' } },
    });
  }
}
