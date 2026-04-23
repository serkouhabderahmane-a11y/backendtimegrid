import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PrismaService } from '../../config/config.module';

const createMockPrisma = () => ({
  patient: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  medicalReport: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  medicineHistory: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  appointment: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  patientStaff: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  employee: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
});

describe('PatientsService', () => {
  let service: PatientsService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    it('should create patient successfully', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        email: 'john@example.com',
      };

      mockPrisma.patient.findFirst.mockResolvedValue(null);
      mockPrisma.patient.create.mockResolvedValue({
        id: 'patient-1',
        tenantId: 'tenant-1',
        ...dto,
        isActive: true,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createPatient('tenant-1', dto, 'user-1');

      expect(result.id).toBe('patient-1');
      expect(result.isActive).toBe(true);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should FAIL - duplicate email for same tenant', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        email: 'existing@example.com',
      };

      mockPrisma.patient.findFirst.mockResolvedValue({
        id: 'existing-patient',
        email: 'existing@example.com',
      });

      await expect(service.createPatient('tenant-1', dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePatient', () => {
    it('should update patient successfully', async () => {
      const mockPatient = {
        id: 'patient-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.patient.update.mockResolvedValue({
        ...mockPatient,
        firstName: 'Jane',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updatePatient(
        'tenant-1',
        'patient-1',
        { firstName: 'Jane' },
        'user-1',
      );

      expect(result.firstName).toBe('Jane');
    });

    it('should FAIL - patient not found', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePatient('tenant-1', 'non-existent', { firstName: 'Jane' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should FAIL - cross-tenant update attempt', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePatient('tenant-A', 'patient-B', { firstName: 'Jane' }, 'user-A'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignStaff', () => {
    const mockPatient = {
      id: 'patient-1',
      tenantId: 'tenant-1',
    };

    const mockStaff = {
      id: 'staff-1',
      tenantId: 'tenant-1',
    };

    it('should assign staff successfully', async () => {
      const dto = { staffId: 'staff-1', isPrimary: true };

      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.employee.findFirst.mockResolvedValue(mockStaff);
      mockPrisma.patientStaff.findFirst.mockResolvedValue(null);
      mockPrisma.patientStaff.updateMany.mockResolvedValue({});
      mockPrisma.patientStaff.create.mockResolvedValue({
        id: 'assignment-1',
        patientId: 'patient-1',
        staffId: 'staff-1',
        isPrimary: true,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.assignStaff('tenant-1', 'patient-1', dto, 'user-1');

      expect(result.isPrimary).toBe(true);
    });

    it('should FAIL - staff already assigned', async () => {
      const dto = { staffId: 'staff-1' };

      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.employee.findFirst.mockResolvedValue(mockStaff);
      mockPrisma.patientStaff.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.assignStaff('tenant-1', 'patient-1', dto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - staff from other tenant', async () => {
      const dto = { staffId: 'staff-other-tenant' };

      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        service.assignStaff('tenant-1', 'patient-1', dto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('medicalReports', () => {
    const mockPatient = {
      id: 'patient-1',
      tenantId: 'tenant-1',
    };

    it('should add medical report successfully', async () => {
      const dto = {
        reportDate: '2024-01-15',
        doctorName: 'Dr. Smith',
        diagnosis: 'Checkup',
        treatment: 'None',
      };

      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.medicalReport.create.mockResolvedValue({
        id: 'report-1',
        ...dto,
        isApproved: false,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.addMedicalReport('tenant-1', 'patient-1', dto, 'user-1');

      expect(result.isApproved).toBe(false);
    });

    it('should approve medical report', async () => {
      const mockReport = {
        id: 'report-1',
        patient: { tenantId: 'tenant-1' },
        immutable: false,
      };

      mockPrisma.medicalReport.findFirst.mockResolvedValue(mockReport);
      mockPrisma.medicalReport.update.mockResolvedValue({
        ...mockReport,
        isApproved: true,
        immutable: true,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.approveMedicalReport(
        'tenant-1',
        'report-1',
        { isApproved: true },
        'user-1',
      );

      expect(result.isApproved).toBe(true);
      expect(result.immutable).toBe(true);
    });

    it('should FAIL - cannot modify immutable report', async () => {
      const mockReport = {
        id: 'report-1',
        patient: { tenantId: 'tenant-1' },
        immutable: true,
      };

      mockPrisma.medicalReport.findFirst.mockResolvedValue(mockReport);

      await expect(
        service.approveMedicalReport(
          'tenant-1',
          'report-1',
          { isApproved: false },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should FAIL - cross-tenant report access', async () => {
      const mockReport = {
        id: 'report-1',
        patient: { tenantId: 'tenant-B' },
      };

      mockPrisma.medicalReport.findFirst.mockResolvedValue(mockReport);

      await expect(
        service.approveMedicalReport(
          'tenant-A',
          'report-1',
          { isApproved: true },
          'user-A',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('appointments', () => {
    it('should create appointment successfully', async () => {
      const dto = {
        patientId: 'patient-1',
        appointmentDate: '2024-01-20T10:00:00Z',
        duration: 30,
        appointmentType: 'checkup',
      };

      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'staff-1' });
      mockPrisma.appointment.create.mockResolvedValue({
        id: 'apt-1',
        status: 'scheduled',
        ...dto,
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createAppointment('tenant-1', dto, 'user-1');

      expect(result.status).toBe('scheduled');
    });

    it('should cancel appointment', async () => {
      const mockAppointment = {
        id: 'apt-1',
        tenantId: 'tenant-1',
        status: 'scheduled',
      };

      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'canceled',
        cancelReason: 'Patient request',
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.cancelAppointment(
        'tenant-1',
        'apt-1',
        'Patient request',
        'user-1',
      );

      expect(result.status).toBe('canceled');
    });

    it('should FAIL - cannot update completed appointment', async () => {
      const mockAppointment = {
        id: 'apt-1',
        status: 'completed',
      };

      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointment('tenant-1', 'apt-1', { notes: 'Updated' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('tenant isolation', () => {
    it('should FAIL - accessing patient from other tenant', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.getPatient('tenant-A', 'patient-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should filter patients by tenant', async () => {
      const mockPatients = [
        { id: 'patient-1', tenantId: 'tenant-1' },
      ];

      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);
      mockPrisma.patient.count.mockResolvedValue(1);

      const result = await service.getPatients('tenant-1', {});

      expect(result.data).toHaveLength(1);
      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });
  });
});
