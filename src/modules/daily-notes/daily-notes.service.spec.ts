import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DailyNotesService, UserContext } from './daily-notes.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  employee: {
    findFirst: jest.fn(),
  },
  dailyNote: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
});

describe('DailyNotesService', () => {
  let service: DailyNotesService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockUserContext: UserContext = {
    userId: 'user-1',
    role: 'admin',
    employeeId: 'emp-1',
  };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyNotesService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DailyNotesService>(DailyNotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    const mockEmployee = {
      id: 'emp-1',
      tenantId: 'tenant-1',
    };

    it('should create note successfully', async () => {
      const data = {
        date: new Date(),
        content: 'Patient showed improvement',
        participantId: 'participant-1',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.dailyNote.findFirst.mockResolvedValue(null);
      mockPrisma.dailyNote.create.mockResolvedValue({
        id: 'note-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'draft',
        ...data,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createNote(
        'tenant-1',
        'user-1',
        'emp-1',
        data,
        mockUserContext,
      );

      expect(result.status).toBe('draft');
      expect(mockPrisma.dailyNote.create).toHaveBeenCalled();
    });

    it('should update existing draft note on same day', async () => {
      const existingNote = {
        id: 'note-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'draft',
        content: 'Old content',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.dailyNote.findFirst.mockResolvedValue(existingNote);
      mockPrisma.dailyNote.update.mockResolvedValue({
        ...existingNote,
        content: 'New content',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createNote(
        'tenant-1',
        'user-1',
        'emp-1',
        { date: new Date(), content: 'New content' },
        mockUserContext,
      );

      expect(result.content).toBe('New content');
      expect(mockPrisma.dailyNote.update).toHaveBeenCalled();
    });

    it('should FAIL - employee not found', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        service.createNote(
          'tenant-1',
          'user-1',
          'emp-invalid',
          { date: new Date(), content: 'Test' },
          mockUserContext,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should FAIL - employee cannot create notes for others', async () => {
      const employeeContext: UserContext = {
        userId: 'user-1',
        role: 'employee',
        employeeId: 'emp-1',
      };

      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-other',
        tenantId: 'tenant-1',
      });

      await expect(
        service.createNote(
          'tenant-1',
          'user-1',
          'emp-other',
          { date: new Date(), content: 'Test' },
          employeeContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - cannot edit locked note', async () => {
      const lockedNote = {
        id: 'note-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'locked',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(mockEmployee);
      mockPrisma.dailyNote.findFirst.mockResolvedValue(lockedNote);

      await expect(
        service.createNote(
          'tenant-1',
          'user-1',
          'emp-1',
          { date: new Date(), content: 'New content' },
          mockUserContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - unauthorized role', async () => {
      const unauthorizedContext: UserContext = {
        userId: 'user-1',
        role: 'invalid_role',
      };

      await expect(
        service.createNote(
          'tenant-1',
          'user-1',
          'emp-1',
          { date: new Date(), content: 'Test' },
          unauthorizedContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitNote', () => {
    it('should submit note successfully', async () => {
      const mockNote = {
        id: 'note-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'draft',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(mockNote);
      mockPrisma.dailyNote.update.mockResolvedValue({
        ...mockNote,
        status: 'submitted',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.submitNote(
        'tenant-1',
        'user-1',
        'note-1',
        mockUserContext,
      );

      expect(result.status).toBe('submitted');
    });

    it('should FAIL - cannot submit locked note', async () => {
      const lockedNote = {
        id: 'note-1',
        status: 'locked',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(lockedNote);

      await expect(
        service.submitNote('tenant-1', 'user-1', 'note-1', mockUserContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - employee cannot submit others notes', async () => {
      const employeeContext: UserContext = {
        userId: 'user-1',
        role: 'employee',
        employeeId: 'emp-1',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue({
        id: 'note-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-other',
        status: 'draft',
      });

      await expect(
        service.submitNote('tenant-1', 'user-1', 'note-1', employeeContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reviewNote', () => {
    it('should review note successfully', async () => {
      const mockNote = {
        id: 'note-1',
        tenantId: 'tenant-1',
        status: 'submitted',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(mockNote);
      mockPrisma.dailyNote.update.mockResolvedValue({
        ...mockNote,
        reviewedAt: new Date(),
        reviewedBy: 'user-1',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.reviewNote(
        'tenant-1',
        'user-1',
        'note-1',
        mockUserContext,
      );

      expect(result.reviewedBy).toBe('user-1');
    });

    it('should FAIL - only manager roles can review', async () => {
      const employeeContext: UserContext = {
        userId: 'user-1',
        role: 'employee',
      };

      await expect(
        service.reviewNote('tenant-1', 'user-1', 'note-1', employeeContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should FAIL - can only review submitted notes', async () => {
      const draftNote = {
        id: 'note-1',
        status: 'draft',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(draftNote);

      await expect(
        service.reviewNote('tenant-1', 'user-1', 'note-1', mockUserContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('lockNote', () => {
    it('should lock note successfully', async () => {
      const mockNote = {
        id: 'note-1',
        tenantId: 'tenant-1',
        status: 'submitted',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(mockNote);
      mockPrisma.dailyNote.update.mockResolvedValue({
        ...mockNote,
        status: 'locked',
        lockedAt: new Date(),
        lockedBy: 'user-1',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.lockNote(
        'tenant-1',
        'user-1',
        'note-1',
        mockUserContext,
      );

      expect(result.status).toBe('locked');
    });

    it('should FAIL - cannot lock already locked note', async () => {
      const lockedNote = {
        id: 'note-1',
        status: 'locked',
      };

      mockPrisma.dailyNote.findFirst.mockResolvedValue(lockedNote);

      await expect(
        service.lockNote('tenant-1', 'user-1', 'note-1', mockUserContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getNotes', () => {
    it('should return notes filtered by access level', async () => {
      const mockNotes = [
        { id: 'note-1', employeeId: 'emp-1', status: 'draft' },
      ];

      mockPrisma.dailyNote.findMany.mockResolvedValue(mockNotes);

      const result = await service.getNotes(
        'tenant-1',
        'user-1',
        {},
        mockUserContext,
      );

      expect(result).toHaveLength(1);
    });

    it('should filter employee access to own notes only', async () => {
      const employeeContext: UserContext = {
        userId: 'user-1',
        role: 'employee',
        employeeId: 'emp-1',
      };

      mockPrisma.dailyNote.findMany.mockResolvedValue([
        { id: 'note-1', employeeId: 'emp-1' },
      ]);

      await service.getNotes('tenant-1', 'user-1', {}, employeeContext);

      expect(mockPrisma.dailyNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: 'emp-1' }),
        }),
      );
    });
  });

  describe('exportNotes', () => {
    it('should export locked notes only', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockNotes = [
        {
          id: 'note-1',
          date: new Date('2024-01-15'),
          content: 'Content',
          employee: { user: { firstName: 'John', lastName: 'Doe' } },
          status: 'locked',
        },
      ];

      mockPrisma.dailyNote.findMany.mockResolvedValue(mockNotes);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.exportNotes(
        'tenant-1',
        'user-1',
        startDate,
        endDate,
        undefined,
        mockUserContext,
      );

      expect(result.notesCount).toBe(1);
      expect(result.data[0].content).toBe('Content');
    });
  });
});
