import { PrismaClient, UserRole, OnboardingState, TimeOffType, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface TestTenant {
  id: string;
  name: string;
  slug: string;
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
}

export interface TestEmployee {
  id: string;
  userId: string;
  tenantId: string;
}

export class TestFactory {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createTenant(data?: Partial<TestTenant>): Promise<TestTenant> {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data?.name || `Test Tenant ${Date.now()}`,
        slug: data?.slug || `test-tenant-${Date.now()}`,
      },
    });
    return tenant;
  }

  async createUser(
    tenantId: string,
    data?: Partial<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }>,
  ): Promise<TestUser> {
    const password = data?.password || 'TestPassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: data?.email || `test-${Date.now()}@example.com`,
        passwordHash,
        firstName: data?.firstName || 'Test',
        lastName: data?.lastName || 'User',
        role: data?.role || 'employee',
        isActive: data?.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      password,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  async createEmployee(
    userId: string,
    tenantId: string,
    data?: Partial<{
      employeeNumber: string;
      departmentId: string;
      locationId: string;
      onboardingStatus: OnboardingState;
      canClockIn: boolean;
      hourlyRate: number;
    }>,
  ): Promise<TestEmployee> {
    const employee = await this.prisma.employee.create({
      data: {
        userId,
        tenantId,
        employeeNumber: data?.employeeNumber || `EMP-${Date.now()}`,
        departmentId: data?.departmentId,
        locationId: data?.locationId,
        onboardingStatus: data?.onboardingStatus || 'employee_active',
        canClockIn: data?.canClockIn !== undefined ? data.canClockIn : true,
        hourlyRate: data?.hourlyRate || 15.0,
        startDate: new Date(),
      },
    });

    return {
      id: employee.id,
      userId: employee.userId,
      tenantId: employee.tenantId,
    };
  }

  async createDepartment(tenantId: string, name?: string) {
    return this.prisma.department.create({
      data: {
        tenantId,
        name: name || `Department ${Date.now()}`,
      },
    });
  }

  async createLocation(tenantId: string, name?: string) {
    return this.prisma.location.create({
      data: {
        tenantId,
        name: name || `Location ${Date.now()}`,
      },
    });
  }

  async createTimeOffBalance(
    employeeId: string,
    tenantId: string,
    type: TimeOffType,
    year: number,
    data?: Partial<{ totalDays: number; usedDays: number; pendingDays: number; carryOverDays: number }>,
  ) {
    return this.prisma.timeOffBalance.create({
      data: {
        employeeId,
        tenantId,
        type,
        year,
        totalDays: data?.totalDays || 15,
        usedDays: data?.usedDays || 0,
        pendingDays: data?.pendingDays || 0,
        carryOverDays: data?.carryOverDays || 0,
      },
    });
  }

  async createPayPeriod(tenantId: string, data?: { startDate?: Date; endDate?: Date }) {
    const startDate = data?.startDate || new Date(new Date().setDate(1));
    const endDate = data?.endDate || new Date(new Date().setDate(15));
    
    return this.prisma.payPeriod.create({
      data: {
        tenantId,
        name: `Pay Period ${startDate.toISOString().slice(0, 10)} - ${endDate.toISOString().slice(0, 10)}`,
        startDate,
        endDate,
      },
    });
  }

  async createAttendanceRecord(
    employeeId: string,
    tenantId: string,
    data?: Partial<{
      clockIn: Date;
      clockOut: Date | null;
      status: AttendanceStatus;
      workDate: Date;
    }>,
  ) {
    const now = new Date();
    const clockIn = data?.clockIn || now;
    const workDate = data?.workDate || new Date(now.setHours(0, 0, 0, 0));

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        tenantId,
        clockIn,
        clockOut: data?.clockOut,
        status: data?.status || 'active',
        workDate,
        isLate: clockIn.getHours() > 9,
      },
    });
  }

  async createPatient(tenantId: string, data?: { firstName?: string; lastName?: string; email?: string }) {
    return this.prisma.patient.create({
      data: {
        tenantId,
        firstName: data?.firstName || 'John',
        lastName: data?.lastName || 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        email: data?.email || `patient-${Date.now()}@example.com`,
      },
    });
  }

  async createHoliday(tenantId: string, date: Date, name?: string) {
    return this.prisma.holiday.create({
      data: {
        tenantId,
        name: name || 'Test Holiday',
        date,
        type: 'national',
        isActive: true,
      },
    });
  }

  async cleanup() {
    await this.prisma.auditLog.deleteMany();
    await this.prisma.refreshToken.deleteMany();
    await this.prisma.attendanceLog.deleteMany();
    await this.prisma.attendanceAdjustment.deleteMany();
    await this.prisma.attendanceRecord.deleteMany();
    await this.prisma.timeOffLog.deleteMany();
    await this.prisma.timeOffRequest.deleteMany();
    await this.prisma.timeOffBalance.deleteMany();
    await this.prisma.payrollRecord.deleteMany();
    await this.prisma.payPeriod.deleteMany();
    await this.prisma.timeEntry.deleteMany();
    await this.prisma.medicationAdministrationRecord.deleteMany();
    await this.prisma.dailyNote.deleteMany();
    await this.prisma.appointment.deleteMany();
    await this.prisma.patientStaff.deleteMany();
    await this.prisma.medicineHistory.deleteMany();
    await this.prisma.medicalReport.deleteMany();
    await this.prisma.patient.deleteMany();
    await this.prisma.employee.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.department.deleteMany();
    await this.prisma.location.deleteMany();
    await this.prisma.holiday.deleteMany();
    await this.prisma.tenant.deleteMany();
  }
}
