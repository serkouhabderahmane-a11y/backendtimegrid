import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

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

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
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
}
