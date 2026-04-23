import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  employee: {
    findFirst: jest.fn(),
  },
  attendanceRecord: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  attendanceLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  attendanceAdjustment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  department: {
    findMany: jest.fn(),
  },
  holiday: {
    findFirst: jest.fn(),
  },
  timeOffRequest: {
    findFirst: jest.fn(),
  },
});

describe('AttendanceService', () => {
  let service: AttendanceService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clockIn', () => {
    const mockEmployee = {
      id: 'emp-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      canClockIn: true,
      onboardingStatus: 'employee_active',
      departmentId: 'dept-1',
      locationId: 'loc-1',
      user: { firstName: 'John', lastName: 'Doe' },
      department: { name: 'Engineering' },
      location: { name: 'Office' },
    };

    it('should clock in successfully', async () => {
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue(null);
      mockPrisma.holiday.findFirst.mockResolvedValue(null);
      mockPrisma.attendanceRecord.create.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(),
        workDate: new Date(),
        isLate: false,
        status: 'active',
      });
      mockPrisma.attendanceLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest);

      expect(result.status).toBe('active');
      expect(mockPrisma.attendanceRecord.create).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should FAIL - double clock-in on same day', async () => {
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue({
        id: 'existing-att',
        status: 'active',
        clockOut: null,
      });

      await expect(
        service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - cannot clock in without completing onboarding', async () => {
      const inactiveEmployee = { ...mockEmployee, canClockIn: false };
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(inactiveEmployee);

      await expect(
        service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - cannot clock in when onboarding not completed', async () => {
      const pendingEmployee = { ...mockEmployee, onboardingStatus: 'in_progress' as const };
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(pendingEmployee);

      await expect(
        service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - cannot clock in when employee not found', async () => {
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - cannot clock in when approved time-off exists', async () => {
      const clockInDto = { deviceType: 'web' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);
      mockPrisma.timeOffRequest.findFirst.mockResolvedValue({ id: 'time-off-1' });

      await expect(
        service.clockIn('user-1', 'tenant-1', clockInDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('clockOut', () => {
    const mockEmployee = {
      id: 'emp-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      user: { firstName: 'John', lastName: 'Doe' },
    };

    const mockActiveClockIn = {
      id: 'att-1',
      employeeId: 'emp-1',
      clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000),
      workDate: new Date(),
      status: 'active',
      breakMinutes: 0,
    };

    it('should clock out successfully', async () => {
      const clockOutDto = { notes: 'Worked on feature X' };
      const mockRequest = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(mockActiveClockIn);
      mockPrisma.attendanceRecord.update.mockResolvedValue({
        ...mockActiveClockIn,
        clockOut: new Date(),
        status: 'completed',
        totalMinutes: 480,
        isEarlyLeave: false,
      });
      mockPrisma.attendanceLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.clockOut('user-1', 'tenant-1', clockOutDto, mockRequest);

      expect(result.status).toBe('completed');
      expect(result.totalMinutes).toBe(480);
      expect(mockPrisma.attendanceRecord.update).toHaveBeenCalled();
    });

    it('should FAIL - clock-out without active clock-in', async () => {
      const clockOutDto = { notes: '' };
      const mockRequest = { ip: '127.0.0.1' };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.clockOut('user-1', 'tenant-1', clockOutDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should flag short work sessions', async () => {
      const shortClockIn = {
        ...mockActiveClockIn,
        clockIn: new Date(Date.now() - 20 * 60 * 1000),
      };
      const clockOutDto = { notes: '' };
      const mockRequest = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(shortClockIn);
      mockPrisma.attendanceRecord.update.mockResolvedValue({
        ...shortClockIn,
        clockOut: new Date(),
        status: 'flagged',
        totalMinutes: 20,
      });
      mockPrisma.attendanceLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.clockOut('user-1', 'tenant-1', clockOutDto, mockRequest);

      expect(result.isFlagged).toBe(true);
    });
  });

  describe('adjustAttendance', () => {
    const mockAttendance = {
      id: 'att-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      clockIn: new Date(),
      clockOut: new Date(),
      totalMinutes: 480,
    };

    it('should adjust attendance successfully with valid reason', async () => {
      const adjustmentDto = {
        clockIn: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        clockOut: new Date().toISOString(),
        totalMinutes: 540,
        reason: 'Team meeting ran late',
      };

      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(mockAttendance);
      mockPrisma.attendanceRecord.update.mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date(adjustmentDto.clockIn),
        clockOut: new Date(adjustmentDto.clockOut),
        totalMinutes: 540,
        status: 'adjusted',
      });
      mockPrisma.attendanceAdjustment.create.mockResolvedValue({});
      mockPrisma.attendanceLog.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.adjustAttendance(
        'tenant-1',
        'att-1',
        adjustmentDto,
        'user-1',
        {},
      );

      expect(result.status).toBe('adjusted');
      expect(mockPrisma.attendanceAdjustment.create).toHaveBeenCalled();
    });

    it('should FAIL - adjustment without sufficient reason', async () => {
      const invalidDto = {
        clockIn: new Date().toISOString(),
        clockOut: new Date().toISOString(),
        reason: 'short',
      };

      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(mockAttendance);

      await expect(
        service.adjustAttendance('tenant-1', 'att-1', invalidDto, 'user-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - adjustment for non-existent attendance', async () => {
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.adjustAttendance(
          'tenant-1',
          'non-existent',
          { reason: 'Valid reason for adjustment' },
          'user-1',
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTodayAttendance', () => {
    it('should return null when no employee found', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      const result = await service.getTodayAttendance('user-1', 'tenant-1');

      expect(result).toBeNull();
    });

    it('should return today attendance record', async () => {
      const mockEmployee = { id: 'emp-1' };
      const mockRecord = {
        id: 'att-1',
        employeeId: 'emp-1',
        status: 'active',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(mockRecord);

      const result = await service.getTodayAttendance('user-1', 'tenant-1');

      expect(result).toEqual(mockRecord);
    });
  });

  describe('getMyStats', () => {
    it('should calculate attendance statistics correctly', async () => {
      const mockEmployee = { id: 'emp-1' };
      const mockRecords = [
        { id: '1', totalMinutes: 480, isLate: true, isEarlyLeave: false, clockIn: new Date() },
        { id: '2', totalMinutes: 500, isLate: false, isEarlyLeave: true, clockIn: new Date() },
        { id: '3', totalMinutes: 510, isLate: false, isEarlyLeave: false, isHolidayWork: true, clockIn: new Date() },
      ];

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.attendanceRecord.findMany.mockResolvedValue(mockRecords);

      const result = await service.getMyStats('user-1', 'tenant-1', {});

      expect(result.totalMinutes).toBe(1490);
      expect(result.lateCount).toBe(1);
      expect(result.earlyLeaveCount).toBe(1);
      expect(result.presentDays).toBe(3);
      expect(result.holidayWorkCount).toBe(1);
    });
  });
});
