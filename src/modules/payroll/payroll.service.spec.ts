import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  payPeriod: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  timeEntry: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  payrollRecord: {
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  employee: {
    findMany: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
});

describe('PayrollService', () => {
  let service: PayrollService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayPeriod', () => {
    it('should create pay period successfully', async () => {
      const data = {
        name: 'January 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
      };

      mockPrisma.payPeriod.create.mockResolvedValue({
        id: 'pp-1',
        tenantId: 'tenant-1',
        ...data,
        status: 'open',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createPayPeriod('tenant-1', 'user-1', data);

      expect(result.id).toBe('pp-1');
      expect(result.status).toBe('open');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('getPayPeriods', () => {
    it('should return all pay periods for tenant only (tenant isolation)', async () => {
      const mockPeriods = [
        { id: 'pp-1', name: 'Jan 2024', tenantId: 'tenant-1' },
      ];

      mockPrisma.payPeriod.findMany.mockResolvedValue(mockPeriods);

      const result = await service.getPayPeriods('tenant-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.payPeriod.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('getPayPeriod', () => {
    it('should return pay period with time entries', async () => {
      const mockPeriod = {
        id: 'pp-1',
        tenantId: 'tenant-1',
        timeEntries: [
          { id: 'te-1', employee: { user: { firstName: 'John' } } },
        ],
      };

      mockPrisma.payPeriod.findFirst.mockResolvedValue(mockPeriod);

      const result = await service.getPayPeriod('tenant-1', 'pp-1');

      expect(result.id).toBe('pp-1');
      expect(result.timeEntries).toHaveLength(1);
    });

    it('should FAIL - pay period not found', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue(null);

      await expect(service.getPayPeriod('tenant-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should FAIL - cannot access pay period from other tenant', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue(null);

      await expect(service.getPayPeriod('tenant-A', 'pp-B')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approveTimesheet', () => {
    it('should approve timesheet successfully', async () => {
      const mockTimeEntry = {
        id: 'te-1',
        payPeriod: { status: 'open' },
      };

      mockPrisma.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);
      mockPrisma.timeEntry.update.mockResolvedValue({
        ...mockTimeEntry,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'user-1',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.approveTimesheet(
        'tenant-1',
        'user-1',
        'te-1',
        { approved: true },
      );

      expect(result.status).toBe('approved');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should reject timesheet with reason', async () => {
      const mockTimeEntry = {
        id: 'te-1',
        payPeriod: { status: 'open' },
      };

      mockPrisma.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);
      mockPrisma.timeEntry.update.mockResolvedValue({
        ...mockTimeEntry,
        status: 'rejected',
        rejectionReason: 'Incorrect hours',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.approveTimesheet(
        'tenant-1',
        'user-1',
        'te-1',
        { approved: false, rejectionReason: 'Incorrect hours' },
      );

      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Incorrect hours');
    });

    it('should FAIL - cannot modify locked pay period', async () => {
      const mockTimeEntry = {
        id: 'te-1',
        payPeriod: { status: 'locked' },
      };

      mockPrisma.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);

      await expect(
        service.approveTimesheet('tenant-1', 'user-1', 'te-1', { approved: true }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('lockPayPeriod', () => {
    it('should lock pay period successfully', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue({
        id: 'pp-1',
        status: 'open',
      });
      mockPrisma.timeEntry.count.mockResolvedValue(0);
      mockPrisma.payPeriod.update.mockResolvedValue({
        id: 'pp-1',
        status: 'locked',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.lockPayPeriod('tenant-1', 'user-1', 'pp-1');

      expect(result.status).toBe('locked');
    });

    it('should FAIL - pay period not open', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue({
        id: 'pp-1',
        status: 'locked',
      });

      await expect(
        service.lockPayPeriod('tenant-1', 'user-1', 'pp-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - unapproved timesheets exist', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue({
        id: 'pp-1',
        status: 'open',
      });
      mockPrisma.timeEntry.count.mockResolvedValue(5);

      await expect(
        service.lockPayPeriod('tenant-1', 'user-1', 'pp-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('calculatePayroll', () => {
    it('should calculate payroll correctly with overtime', async () => {
      const mockPayPeriod = {
        id: 'pp-1',
        tenantId: 'tenant-1',
        status: 'locked',
      };

      const mockTimeEntries = [
        {
          id: 'te-1',
          employeeId: 'emp-1',
          totalMinutes: 600,
          breakMinutes: 30,
          status: 'approved',
          employee: { id: 'emp-1', hourlyRate: 15 },
        },
      ];

      mockPrisma.payPeriod.findFirst.mockResolvedValue(mockPayPeriod);
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockTimeEntries);
      mockPrisma.tenant.findUnique.mockResolvedValue({
        settings: JSON.stringify({
          overtimeThreshold: 480,
          overtimeMultiplier: 1.5,
          defaultPayRate: 15,
        }),
      });
      mockPrisma.payrollRecord.upsert.mockResolvedValue({
        id: 'pr-1',
        employeeId: 'emp-1',
        totalHours: 18,
        overtimeHours: 1.5,
        grossPay: 333.75,
      });
      mockPrisma.payPeriod.update.mockResolvedValue({
        ...mockPayPeriod,
        status: 'calculated',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.calculatePayroll('tenant-1', 'user-1', 'pp-1');

      expect(result.records).toHaveLength(1);
      expect(mockPrisma.payrollRecord.upsert).toHaveBeenCalled();
    });

    it('should FAIL - pay period not locked', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue({
        id: 'pp-1',
        status: 'open',
      });

      await expect(
        service.calculatePayroll('tenant-1', 'user-1', 'pp-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('exportPayroll', () => {
    it('should export payroll data', async () => {
      const mockPayPeriod = {
        id: 'pp-1',
        tenantId: 'tenant-1',
        name: 'Jan 2024',
        status: 'calculated',
      };

      const mockRecords = [
        {
          id: 'pr-1',
          employeeId: 'emp-1',
          totalHours: 80,
          overtimeHours: 5,
          grossPay: 1500,
          employee: {
            user: { firstName: 'John', lastName: 'Doe' },
            employeeNumber: 'EMP-001',
          },
        },
      ];

      mockPrisma.payPeriod.findFirst.mockResolvedValue(mockPayPeriod);
      mockPrisma.payrollRecord.findMany.mockResolvedValue(mockRecords);
      mockPrisma.payPeriod.update.mockResolvedValue({
        ...mockPayPeriod,
        status: 'exported',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.exportPayroll(
        'tenant-1',
        'user-1',
        'pp-1',
        'csv',
        'csv',
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].employeeName).toBe('John Doe');
    });

    it('should FAIL - payroll not calculated', async () => {
      mockPrisma.payPeriod.findFirst.mockResolvedValue({
        id: 'pp-1',
        status: 'open',
      });

      await expect(
        service.exportPayroll('tenant-1', 'user-1', 'pp-1', 'csv', 'csv'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
