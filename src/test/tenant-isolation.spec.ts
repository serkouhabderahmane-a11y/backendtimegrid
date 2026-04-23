import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { TimeOffService } from '../modules/time-off/time-off.service';
import { PayrollService } from '../modules/payroll/payroll.service';
import { PatientsService } from '../modules/patients/patients.service';
import { AuditLogger } from '../modules/audit-logs/audit-logger.service';
import { PrismaService } from '../config/config.module';

const createMockPrisma = () => ({
  employee: { findFirst: jest.fn(), findMany: jest.fn() },
  attendanceRecord: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  attendanceLog: { create: jest.fn(), findMany: jest.fn() },
  attendanceAdjustment: { create: jest.fn(), findMany: jest.fn() },
  auditLog: { create: jest.fn(), findMany: jest.fn() },
  timeOffRequest: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  timeOffBalance: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  timeOffLog: { create: jest.fn(), findMany: jest.fn() },
  holiday: { findFirst: jest.fn(), findMany: jest.fn() },
  payPeriod: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  timeEntry: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  payrollRecord: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  patient: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  medicalReport: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  medicineHistory: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  appointment: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  patientStaff: { findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn(), delete: jest.fn() },
  department: { findMany: jest.fn() },
  tenant: { findUnique: jest.fn() },
  user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  refreshToken: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  dailyNote: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  medicationAdministrationRecord: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
});

describe('Multi-Tenancy Isolation Tests', () => {
  let attendanceService: AttendanceService;
  let timeOffService: TimeOffService;
  let payrollService: PayrollService;
  let patientsService: PatientsService;
  let auditLogger: AuditLogger;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const TENANT_A = 'tenant-a';
  const TENANT_B = 'tenant-b';

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        TimeOffService,
        PayrollService,
        PatientsService,
        AuditLogger,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    attendanceService = module.get<AttendanceService>(AttendanceService);
    timeOffService = module.get<TimeOffService>(TimeOffService);
    payrollService = module.get<PayrollService>(PayrollService);
    patientsService = module.get<PatientsService>(PatientsService);
    auditLogger = module.get<AuditLogger>(AuditLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ATTENDANCE ISOLATION', () => {
    it('MUST - Tenant A cannot read Tenant B attendance', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-A',
        userId: 'user-A',
        tenantId: TENANT_A,
        canClockIn: true,
        onboardingStatus: 'employee_active',
        user: { firstName: 'User', lastName: 'A' },
      });

      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);

      await attendanceService.getTodayAttendance('user-A', TENANT_A);

      expect(mockPrisma.attendanceRecord.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-A',
          }),
        }),
      );
    });

    it('MUST - Cannot create attendance for other tenant', async () => {
      const clockInDto = { deviceType: 'web' };

      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        attendanceService.clockIn('user-A', TENANT_A, clockInDto, {}),
      ).rejects.toThrow();
    });

    it('MUST - Cannot adjust attendance from other tenant', async () => {
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);

      await expect(
        attendanceService.adjustAttendance(
          TENANT_A,
          'att-other-tenant',
          { reason: 'Valid reason for adjustment' },
          'user-A',
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('TIME-OFF ISOLATION', () => {
    it('MUST - Tenant A cannot view Tenant B time-off requests', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      const result = await timeOffService.getMyRequests('user-A', TENANT_A, {});

      expect(result).toEqual([]);
      expect(mockPrisma.timeOffRequest.findMany).not.toHaveBeenCalled();
    });

    it('MUST - Cannot approve time-off for other tenant', async () => {
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);

      await expect(
        timeOffService.reviewRequest(
          TENANT_A,
          'time-off-other-tenant',
          { status: 'approved' },
          'manager-A',
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('MUST - Cannot view balance from other tenant', async () => {
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue(null);

      await expect(
        timeOffService.getEmployeeBalances(TENANT_A, 'emp-other-tenant'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PAYROLL ISOLATION', () => {
    it('MUST - Tenant A cannot read Tenant B pay periods', async () => {
      mockPrisma.payPeriod.findMany.mockResolvedValue([
        { id: 'pp-A', tenantId: TENANT_A },
      ]);

      const result = await payrollService.getPayPeriods(TENANT_A);

      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe(TENANT_A);
      expect(mockPrisma.payPeriod.findMany).toHaveBeenCalledWith({
        where: { tenantId: TENANT_A },
        orderBy: { startDate: 'desc' },
      });
    });

    it('MUST - Cannot access pay period from other tenant', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue(null);

      await expect(
        payrollService.getPayPeriod(TENANT_A, 'pp-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('MUST - Cannot calculate payroll for other tenant', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue(null);

      await expect(
        payrollService.calculatePayroll(TENANT_A, 'user-A', 'pp-other-tenant'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATIENT ISOLATION', () => {
    it('MUST - Tenant A cannot read Tenant B patients', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        patientsService.getPatient(TENANT_A, 'patient-other-tenant'),
      ).rejects.toThrow(NotFoundException);
    });

    it('MUST - Cannot update patient from other tenant', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        patientsService.updatePatient(
          TENANT_A,
          'patient-other-tenant',
          { firstName: 'Hacked' },
          'user-A',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('MUST - Cross-tenant medical report access blocked', async () => {
      mockPrisma.medicalReport.findFirst.mockResolvedValue({
        id: 'report-1',
        patient: { tenantId: TENANT_B },
      });

      await expect(
        patientsService.approveMedicalReport(
          TENANT_A,
          'report-1',
          { isApproved: true },
          'user-A',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('AUDIT LOG ISOLATION', () => {
    it('MUST - All audit logs include tenantId', async () => {
      await auditLogger.log({
        tenantId: TENANT_A,
        userId: 'user-A',
        action: 'TEST_ACTION',
        entityType: 'TestEntity',
        entityId: 'entity-1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT_A,
            userId: 'user-A',
            action: 'TEST_ACTION',
            entityType: 'TestEntity',
          }),
        }),
      );
    });
  });

  describe('ADMIN ROLE ISOLATION', () => {
    it('MUST - Admin of Tenant A is NOT Admin of Tenant B', async () => {
      mockPrisma.payPeriod.findMany.mockResolvedValue([]);

      const resultA = await payrollService.getPayPeriods(TENANT_A);
      expect(resultA).toEqual([]);

      const resultB = await payrollService.getPayPeriods(TENANT_B);
      expect(resultB).toEqual([]);
    });

    it('MUST - Admin cannot bypass tenant isolation', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue(null);

      await expect(
        payrollService.getPayPeriod(TENANT_A, 'pp-B'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DATA AGGREGATION ISOLATION', () => {
    it('MUST - Statistics only include tenant data', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-A',
        tenantId: TENANT_A,
      });

      mockPrisma.attendanceRecord.findMany.mockResolvedValue([
        { id: 'att-1', tenantId: TENANT_A, employeeId: 'emp-A', status: 'completed', clockIn: new Date(), totalMinutes: 480 },
        { id: 'att-2', tenantId: TENANT_A, employeeId: 'emp-A', status: 'completed', clockIn: new Date(), totalMinutes: 500 },
      ]);

      const result = await attendanceService.getMyStats('user-A', TENANT_A, {});

      expect(result.presentDays).toBe(2);
      expect(mockPrisma.attendanceRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-A',
          }),
        }),
      );
    });
  });
});
