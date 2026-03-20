import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  private async getOpenPayPeriod(tenantId: string) {
    return this.prisma.payPeriod.findFirst({
      where: { tenantId, status: 'open' },
      orderBy: { startDate: 'desc' },
    });
  }

  async clockIn(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      throw new ForbiddenException('Employee record not found');
    }

    if (!employee.canClockIn) {
      throw new ForbiddenException(
        'Cannot clock in. Complete onboarding first.',
      );
    }

    if (employee.onboardingStatus !== 'employee_active') {
      throw new ForbiddenException(
        'Onboarding must be completed before clocking in.',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await this.prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: {
          gte: today,
          lt: tomorrow,
        },
        clockOut: null,
      },
    });

    if (existingEntry) {
      throw new ForbiddenException('Already clocked in today');
    }

    const openPayPeriod = await this.getOpenPayPeriod(tenantId);

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
        payPeriodId: openPayPeriod?.id,
        status: openPayPeriod ? 'submitted' : 'draft',
      },
    });

    return timeEntry;
  }

  async clockOut(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      throw new ForbiddenException('Employee record not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: {
          gte: today,
          lt: tomorrow,
        },
        clockOut: null,
      },
    });

    if (!timeEntry) {
      throw new ForbiddenException('No active clock-in found');
    }

    const clockOut = new Date();
    const totalMinutes = Math.floor(
      (clockOut.getTime() - timeEntry.clockIn.getTime()) / 60000,
    );

    const updated = await this.prisma.timeEntry.update({
      where: { id: timeEntry.id },
      data: {
        clockOut,
        totalMinutes,
      },
    });

    return updated;
  }

  async getTodayEntry(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  async getEntries(userId: string, tenantId: string, startDate?: Date, endDate?: Date) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });

    if (!employee) {
      return [];
    }

    const where: any = { employeeId: employee.id };

    if (startDate && endDate) {
      where.clockIn = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.timeEntry.findMany({
      where,
      orderBy: { clockIn: 'desc' },
    });
  }

  async getAllTimesheets(tenantId: string, payPeriodId?: string) {
    const where: any = { tenantId };
    
    if (payPeriodId) {
      where.payPeriodId = payPeriodId;
    }

    const employees = await this.prisma.employee.findMany({
      where: { tenantId },
      include: { user: true },
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const timesheets = await this.prisma.timeEntry.findMany({
      where,
      include: { employee: { include: { user: true } } },
      orderBy: { clockIn: 'desc' },
    });

    return timesheets;
  }

  async assignToPayPeriod(tenantId: string, timesheetId: string, payPeriodId: string) {
    const timesheet = await this.prisma.timeEntry.findFirst({
      where: { id: timesheetId },
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    const payPeriod = await this.prisma.payPeriod.findFirst({
      where: { id: payPeriodId, tenantId },
    });

    if (!payPeriod) {
      throw new NotFoundException('Pay period not found');
    }

    if (payPeriod.status !== 'open') {
      throw new ForbiddenException('Cannot assign timesheet to locked pay period');
    }

    return this.prisma.timeEntry.update({
      where: { id: timesheetId },
      data: {
        payPeriodId,
        status: 'submitted',
      },
    });
  }

  async approveTimesheet(tenantId: string, timesheetId: string, userId: string) {
    const timesheet = await this.prisma.timeEntry.findFirst({
      where: { id: timesheetId },
      include: { employee: true },
    });

    if (!timesheet || timesheet.employee.tenantId !== tenantId) {
      throw new NotFoundException('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new BadRequestException('Only submitted timesheets can be approved');
    }

    const updated = await this.prisma.timeEntry.update({
      where: { id: timesheetId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'APPROVE_TIMESHEET',
        entityType: 'TimeEntry',
        entityId: timesheetId,
      },
    });

    return updated;
  }

  async rejectTimesheet(tenantId: string, timesheetId: string, userId: string, reason: string) {
    const timesheet = await this.prisma.timeEntry.findFirst({
      where: { id: timesheetId },
      include: { employee: true },
    });

    if (!timesheet || timesheet.employee.tenantId !== tenantId) {
      throw new NotFoundException('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new BadRequestException('Only submitted timesheets can be rejected');
    }

    const updated = await this.prisma.timeEntry.update({
      where: { id: timesheetId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'REJECT_TIMESHEET',
        entityType: 'TimeEntry',
        entityId: timesheetId,
        metadata: JSON.stringify({ reason }),
      },
    });

    return updated;
  }

  async reviewTimesheet(tenantId: string, timesheetId: string, userId: string) {
    const timesheet = await this.prisma.timeEntry.findFirst({
      where: { id: timesheetId },
      include: { employee: true },
    });

    if (!timesheet || timesheet.employee.tenantId !== tenantId) {
      throw new NotFoundException('Timesheet not found');
    }

    if (timesheet.status !== 'approved') {
      throw new BadRequestException('Only approved timesheets can be reviewed by HR');
    }

    return { 
      ...timesheet, 
      hrReviewed: true,
      hrReviewedAt: new Date(),
    };
  }

  async getTimesheetsForPayPeriod(tenantId: string, payPeriodId: string) {
    const timesheets = await this.prisma.timeEntry.findMany({
      where: {
        payPeriodId,
        employee: {
          tenantId,
        },
      },
      include: {
        employee: {
          include: { user: true },
        },
      },
      orderBy: { clockIn: 'asc' },
    });

    return timesheets;
  }
}
