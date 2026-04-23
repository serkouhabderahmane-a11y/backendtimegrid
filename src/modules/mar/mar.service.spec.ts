import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MarService, UserContext } from './mar.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  employee: {
    findFirst: jest.fn(),
  },
  medicationAdministrationRecord: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
});

describe('MarService', () => {
  let service: MarService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockAdminContext: UserContext = {
    userId: 'user-1',
    role: 'admin',
    employeeId: 'emp-1',
  };

  const mockEmployeeContext: UserContext = {
    userId: 'user-1',
    role: 'employee',
    employeeId: 'emp-1',
  };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MarService>(MarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMarEntry', () => {
    const mockEmployee = {
      id: 'emp-1',
      tenantId: 'tenant-1',
    };

    it('should create MAR entry successfully', async () => {
      const data = {
        medicationName: 'Aspirin',
        scheduledTime: new Date(),
        participantId: 'participant-1',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.medicationAdministrationRecord.create.mockResolvedValue({
        id: 'mar-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        outcome: 'scheduled',
        ...data,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createMarEntry(
        'tenant-1',
        'user-1',
        'emp-1',
        data,
        mockAdminContext,
      );

      expect(result.outcome).toBe('scheduled');
      expect(mockPrisma.medicationAdministrationRecord.create).toHaveBeenCalled();
    });

    it('should FAIL - employee cannot create for others', async () => {
      const data = {
        medicationName: 'Aspirin',
        scheduledTime: new Date(),
      };

      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-other',
        tenantId: 'tenant-1',
      });

      await expect(
        service.createMarEntry(
          'tenant-1',
          'user-1',
          'emp-other',
          data,
          mockEmployeeContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - unauthorized role', async () => {
      const unauthorizedContext: UserContext = {
        userId: 'user-1',
        role: 'invalid_role',
      };

      await expect(
        service.createMarEntry(
          'tenant-1',
          'user-1',
          'emp-1',
          { medicationName: 'Aspirin', scheduledTime: new Date() },
          unauthorizedContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('recordOutcome', () => {
    it('should record given outcome successfully', async () => {
      const mockEntry = {
        id: 'mar-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        outcome: 'scheduled',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.medicationAdministrationRecord.update.mockResolvedValue({
        ...mockEntry,
        outcome: 'given',
        outcomeTime: new Date(),
        administeredBy: 'user-1',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.recordOutcome(
        'tenant-1',
        'user-1',
        'mar-1',
        { outcome: 'given' },
        mockAdminContext,
      );

      expect(result.outcome).toBe('given');
    });

    it('should record missed outcome', async () => {
      const mockEntry = {
        id: 'mar-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        outcome: 'scheduled',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.medicationAdministrationRecord.update.mockResolvedValue({
        ...mockEntry,
        outcome: 'missed',
        reasonNotGiven: 'Patient was unavailable',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.recordOutcome(
        'tenant-1',
        'user-1',
        'mar-1',
        { outcome: 'missed', reasonNotGiven: 'Patient was unavailable' },
        mockAdminContext,
      );

      expect(result.outcome).toBe('missed');
      expect(result.reasonNotGiven).toBe('Patient was unavailable');
    });

    it('should record refused outcome', async () => {
      const mockEntry = {
        id: 'mar-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        outcome: 'scheduled',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.medicationAdministrationRecord.update.mockResolvedValue({
        ...mockEntry,
        outcome: 'refused',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.recordOutcome(
        'tenant-1',
        'user-1',
        'mar-1',
        { outcome: 'refused' },
        mockAdminContext,
      );

      expect(result.outcome).toBe('refused');
    });

    it('should FAIL - cannot modify locked entry', async () => {
      const lockedEntry = {
        id: 'mar-1',
        outcome: 'locked',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(lockedEntry);

      await expect(
        service.recordOutcome(
          'tenant-1',
          'user-1',
          'mar-1',
          { outcome: 'given' },
          mockAdminContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - entry not found', async () => {
      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.recordOutcome(
          'tenant-1',
          'user-1',
          'non-existent',
          { outcome: 'given' },
          mockAdminContext,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('lockEntry', () => {
    it('should lock entry successfully', async () => {
      const mockEntry = {
        id: 'mar-1',
        tenantId: 'tenant-1',
        outcome: 'given',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.medicationAdministrationRecord.update.mockResolvedValue({
        ...mockEntry,
        outcome: 'locked',
        lockedAt: new Date(),
        lockedBy: 'user-1',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.lockEntry(
        'tenant-1',
        'user-1',
        'mar-1',
        mockAdminContext,
      );

      expect(result.outcome).toBe('locked');
    });

    it('should FAIL - employee cannot lock entries', async () => {
      await expect(
        service.lockEntry('tenant-1', 'user-1', 'mar-1', mockEmployeeContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - entry already locked', async () => {
      const lockedEntry = {
        id: 'mar-1',
        outcome: 'locked',
      };

      mockPrisma.medicationAdministrationRecord.findFirst.mockResolvedValue(lockedEntry);

      await expect(
        service.lockEntry('tenant-1', 'user-1', 'mar-1', mockAdminContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMarEntries', () => {
    it('should return entries for admin', async () => {
      const mockEntries = [
        { id: 'mar-1', employeeId: 'emp-1', outcome: 'given' },
        { id: 'mar-2', employeeId: 'emp-2', outcome: 'missed' },
      ];

      mockPrisma.medicationAdministrationRecord.findMany.mockResolvedValue(mockEntries);

      const result = await service.getMarEntries(
        'tenant-1',
        'user-1',
        {},
        mockAdminContext,
      );

      expect(result).toHaveLength(2);
    });

    it('should filter entries for employee to own only', async () => {
      mockPrisma.medicationAdministrationRecord.findMany.mockResolvedValue([
        { id: 'mar-1', employeeId: 'emp-1' },
      ]);

      await service.getMarEntries(
        'tenant-1',
        'user-1',
        {},
        mockEmployeeContext,
      );

      expect(mockPrisma.medicationAdministrationRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: 'emp-1' }),
        }),
      );
    });

    it('should filter by outcome', async () => {
      mockPrisma.medicationAdministrationRecord.findMany.mockResolvedValue([]);

      await service.getMarEntries(
        'tenant-1',
        'user-1',
        { outcome: 'missed' },
        mockAdminContext,
      );

      expect(mockPrisma.medicationAdministrationRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ outcome: 'missed' }),
        }),
      );
    });
  });

  describe('exportMarEntries', () => {
    it('should export MAR entries for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockEntries = [
        {
          id: 'mar-1',
          medicationName: 'Aspirin',
          outcome: 'given',
          employee: { user: { firstName: 'John', lastName: 'Doe' } },
        },
      ];

      mockPrisma.medicationAdministrationRecord.findMany.mockResolvedValue(mockEntries);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.exportMarEntries(
        'tenant-1',
        'user-1',
        startDate,
        endDate,
        undefined,
        mockAdminContext,
      );

      expect(result.entriesCount).toBe(1);
      expect(result.data[0].medicationName).toBe('Aspirin');
    });

    it('should filter by employee when context is employee', async () => {
      mockPrisma.medicationAdministrationRecord.findMany.mockResolvedValue([]);

      await service.exportMarEntries(
        'tenant-1',
        'user-1',
        new Date(),
        new Date(),
        undefined,
        mockEmployeeContext,
      );

      expect(mockPrisma.medicationAdministrationRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: 'emp-1' }),
        }),
      );
    });
  });
});
