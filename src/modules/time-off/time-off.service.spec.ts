import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimeOffService } from './time-off.service';
import { PrismaService } from '../../config/config.module';
import { TimeOffType } from '@prisma/client';

const createMockPrisma = () => ({
  employee: {
    findFirst: jest.fn(),
  },
  timeOffRequest: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  timeOffBalance: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  timeOffLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  holiday: {
    findMany: jest.fn(),
  },
});

describe('TimeOffService', () => {
  let service: TimeOffService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TimeOffService>(TimeOffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    const mockEmployee = {
      id: 'emp-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      departmentId: 'dept-1',
      locationId: 'loc-1',
      user: { firstName: 'John', lastName: 'Doe' },
    };

    it('should create time-off request successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);

      const dto = {
        type: 'annual' as TimeOffType,
        startDate: futureDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: 'Vacation',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);
      mockPrisma.holiday.findMany.mockResolvedValue([]);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        totalDays: 15,
        usedDays: 0,
        pendingDays: 0,
        carryOverDays: 0,
      });
      mockPrisma.timeOffBalance.update.mockResolvedValue({});
      mockPrisma.timeOffRequest.create.mockResolvedValue({
        id: 'req-1',
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        type: 'annual',
        status: 'pending',
        totalDays: 3,
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createRequest('user-1', 'tenant-1', dto, {});

      expect(result.status).toBe('pending');
      expect(result.totalDays).toBe(3);
      expect(mockPrisma.timeOffRequest.create).toHaveBeenCalled();
    });

    it('should FAIL - insufficient balance for annual leave', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 20);

      const dto = {
        type: 'annual' as TimeOffType,
        startDate: futureDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: 'Long vacation',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);
      mockPrisma.holiday.findMany.mockResolvedValue([]);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        totalDays: 10,
        usedDays: 5,
        pendingDays: 0,
        carryOverDays: 0,
      });

      await expect(
        service.createRequest('user-1', 'tenant-1', dto, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - start date after end date', async () => {
      const dto = {
        type: 'annual' as TimeOffType,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Invalid dates',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);

      await expect(
        service.createRequest('user-1', 'tenant-1', dto, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - request for past dates', async () => {
      const dto = {
        type: 'annual' as TimeOffType,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Past vacation',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);

      await expect(
        service.createRequest('user-1', 'tenant-1', dto, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - conflicting time-off request exists', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);

      const dto = {
        type: 'annual' as TimeOffType,
        startDate: futureDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: 'Vacation',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue({
        id: 'existing-req',
        status: 'pending',
      });

      await expect(
        service.createRequest('user-1', 'tenant-1', dto, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow unpaid time-off without balance check', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 30);

      const dto = {
        type: 'unpaid' as TimeOffType,
        startDate: futureDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: 'Extended unpaid leave',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);
      mockPrisma.holiday.findMany.mockResolvedValue([]);
      mockPrisma.timeOffRequest.create.mockResolvedValue({
        id: 'req-1',
        status: 'pending',
        type: 'unpaid',
        totalDays: 22,
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createRequest('user-1', 'tenant-1', dto, {});

      expect(result.status).toBe('pending');
      expect(mockPrisma.timeOffBalance.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('reviewRequest', () => {
    const mockTimeOffRequest = {
      id: 'req-1',
      employeeId: 'emp-1',
      tenantId: 'tenant-1',
      type: 'annual',
      status: 'pending',
      totalDays: 3,
      startDate: new Date(),
      employee: { id: 'emp-1' },
    };

    it('should approve time-off request successfully', async () => {
      const dto = { status: 'approved', comment: 'Approved' };

      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(mockTimeOffRequest);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        usedDays: 0,
        pendingDays: 3,
      });
      mockPrisma.timeOffBalance.update.mockResolvedValue({});
      mockPrisma.timeOffRequest.update.mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'approved',
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.reviewRequest('tenant-1', 'req-1', dto, 'manager-1', {});

      expect(result.status).toBe('approved');
      expect(mockPrisma.timeOffBalance.update).toHaveBeenCalled();
    });

    it('should reject time-off request successfully', async () => {
      const dto = { status: 'rejected', comment: 'Budget constraints' };

      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(mockTimeOffRequest);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        usedDays: 0,
        pendingDays: 3,
      });
      mockPrisma.timeOffBalance.update.mockResolvedValue({});
      mockPrisma.timeOffRequest.update.mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'rejected',
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.reviewRequest('tenant-1', 'req-1', dto, 'manager-1', {});

      expect(result.status).toBe('rejected');
    });

    it('should FAIL - approve already reviewed request (approve twice)', async () => {
      const approvedRequest = { ...mockTimeOffRequest, status: 'approved' };

      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(approvedRequest);

      await expect(
        service.reviewRequest(
          'tenant-1',
          'req-1',
          { status: 'approved', comment: 'Approve' },
          'manager-1',
          {},
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - review non-existent request', async () => {
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.reviewRequest(
          'tenant-1',
          'non-existent',
          { status: 'approved', comment: 'Approve' },
          'manager-1',
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should deduct balance only on approval, not on rejection', async () => {
      const dto = { status: 'rejected', comment: 'Denied' };

      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(mockTimeOffRequest);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        usedDays: 0,
        pendingDays: 3,
      });
      mockPrisma.timeOffBalance.update.mockResolvedValue({});
      mockPrisma.timeOffRequest.update.mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'rejected',
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.reviewRequest('tenant-1', 'req-1', dto, 'manager-1', {});

      const balanceUpdateCall = mockPrisma.timeOffBalance.update.mock.calls[0];
      expect(balanceUpdateCall[0].data.pendingDays).toBe(0);
      expect(balanceUpdateCall[0].data.usedDays).toBeUndefined();
    });
  });

  describe('cancelMyRequest', () => {
    const mockEmployee = {
      id: 'emp-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
    };

    const mockTimeOffRequest = {
      id: 'req-1',
      employeeId: 'emp-1',
      type: 'annual',
      status: 'pending',
      totalDays: 3,
      startDate: new Date(),
    };

    it('should cancel pending request successfully', async () => {
      const dto = { reason: 'Changed plans' };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(mockTimeOffRequest);
      mockPrisma.timeOffBalance.findFirst.mockResolvedValue({
        id: 'bal-1',
        pendingDays: 3,
      });
      mockPrisma.timeOffBalance.update.mockResolvedValue({});
      mockPrisma.timeOffRequest.update.mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'canceled',
      });
      mockPrisma.timeOffLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.cancelMyRequest('user-1', 'tenant-1', 'req-1', dto, {});

      expect(result.status).toBe('canceled');
    });

    it('should FAIL - cannot cancel already approved request', async () => {
      const approvedRequest = { ...mockTimeOffRequest, status: 'approved' };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(approvedRequest);

      await expect(
        service.cancelMyRequest(
          'user-1',
          'tenant-1',
          'req-1',
          { reason: 'Changed plans' },
          {},
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateBusinessDays', () => {
    it('should calculate business days correctly', async () => {
      const startDate = new Date('2024-01-08');
      const endDate = new Date('2024-01-12');

      const serviceAny = service as any;
      const result = serviceAny.calculateBusinessDays(startDate, endDate);

      expect(result).toBe(5);
    });

    it('should exclude weekends', async () => {
      const startDate = new Date('2024-01-08');
      const endDate = new Date('2024-01-14');

      const serviceAny = service as any;
      const result = serviceAny.calculateBusinessDays(startDate, endDate);

      expect(result).toBe(5);
    });
  });
});
