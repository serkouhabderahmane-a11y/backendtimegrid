import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogger } from './audit-logger.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
});

describe('AuditLogger', () => {
  let logger: AuditLogger;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogger,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    logger = module.get<AuditLogger>(AuditLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create audit log with all required fields', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'CREATE',
        entityType: 'Employee',
        entityId: 'emp-1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          action: 'CREATE',
          entityType: 'Employee',
          entityId: 'emp-1',
        }),
      });
    });

    it('should include old and new values when provided', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'UPDATE',
        entityType: 'Patient',
        entityId: 'patient-1',
        oldValues: { name: 'Old Name' },
        newValues: { name: 'New Name' },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          oldValues: JSON.stringify({ name: 'Old Name' }),
          newValues: JSON.stringify({ name: 'New Name' }),
        }),
      });
    });

    it('should include metadata when provided', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'APPROVE',
        entityType: 'TimeOffRequest',
        entityId: 'req-1',
        metadata: { comment: 'Approved by manager' },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: JSON.stringify({ comment: 'Approved by manager' }),
        }),
      });
    });

    it('should include IP address and user agent when provided', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'LOGIN',
        entityType: 'Session',
        entityId: 'session-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      });
    });

    it('should handle optional fields gracefully', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        action: 'SYSTEM_EVENT',
        entityType: 'System',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
        }),
      });
    });
  });

  describe('logCreate', () => {
    it('should log create action with new values', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.logCreate(
        'tenant-1',
        'user-1',
        'Patient',
        'patient-1',
        { firstName: 'John', lastName: 'Doe' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CREATE',
          entityType: 'Patient',
          entityId: 'patient-1',
          newValues: JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
        }),
      });
    });
  });

  describe('logUpdate', () => {
    it('should log update action with old and new values', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.logUpdate(
        'tenant-1',
        'user-1',
        'Patient',
        'patient-1',
        { firstName: 'John' },
        { firstName: 'Jane' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'UPDATE',
          entityType: 'Patient',
          entityId: 'patient-1',
          oldValues: JSON.stringify({ firstName: 'John' }),
          newValues: JSON.stringify({ firstName: 'Jane' }),
        }),
      });
    });
  });

  describe('logDelete', () => {
    it('should log delete action with old values', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.logDelete(
        'tenant-1',
        'user-1',
        'Document',
        'doc-1',
        { name: 'Old Document', content: 'Content' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'DELETE',
          entityType: 'Document',
          entityId: 'doc-1',
          oldValues: JSON.stringify({ name: 'Old Document', content: 'Content' }),
        }),
      });
    });
  });

  describe('logStateTransition', () => {
    it('should log state transition with old and new state', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.logStateTransition(
        'tenant-1',
        'user-1',
        'Candidate',
        'candidate-1',
        'pending_hr_review',
        'approved',
        { approvedBy: 'hr-manager' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'STATE_TRANSITION',
          entityType: 'Candidate',
          entityId: 'candidate-1',
          oldValues: JSON.stringify({ state: 'pending_hr_review' }),
          newValues: JSON.stringify({ state: 'approved' }),
          metadata: JSON.stringify({ approvedBy: 'hr-manager' }),
        }),
      });
    });
  });

  describe('CRITICAL BUSINESS EVENTS', () => {
    it('should log clock-in events', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'CLOCK_IN',
        entityType: 'AttendanceRecord',
        entityId: 'att-1',
        metadata: { isLate: true },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should log clock-out events', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'CLOCK_OUT',
        entityType: 'AttendanceRecord',
        entityId: 'att-1',
        metadata: { totalMinutes: 480, isFlagged: false },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should log time-off approvals', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'manager-1',
        action: 'TIME_OFF_APPROVED',
        entityType: 'TimeOffRequest',
        entityId: 'req-1',
        metadata: { type: 'annual', totalDays: 5 },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should log payroll calculations', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'admin-1',
        action: 'CALCULATE_PAYROLL',
        entityType: 'PayPeriod',
        entityId: 'pp-1',
        metadata: { recordsCount: 25 },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should log patient access', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'staff-1',
        action: 'CREATE_PATIENT',
        entityType: 'Patient',
        entityId: 'patient-1',
        metadata: { name: 'John Doe' },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('AUDIT LOG REQUIREMENTS', () => {
    it('MUST include userId for all user actions', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'UPDATE',
        entityType: 'Entity',
        entityId: 'entity-1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
        }),
      });
    });

    it('MUST include tenantId for all operations', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        action: 'TEST',
        entityType: 'Entity',
        entityId: 'entity-1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
        }),
      });
    });

    it('MUST include entity type and id', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await logger.log({
        tenantId: 'tenant-1',
        action: 'CREATE',
        entityType: 'Patient',
        entityId: 'patient-123',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entityType: 'Patient',
          entityId: 'patient-123',
        }),
      });
    });
  });
});
