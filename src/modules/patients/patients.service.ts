import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import {
  CreatePatientDto,
  UpdatePatientDto,
  MedicalReportDto,
  ApproveMedicalReportDto,
  MedicineDto,
  UpdateMedicineDto,
  AppointmentDto,
  UpdateAppointmentDto,
  PatientQueryDto,
  AppointmentQueryDto,
  AssignStaffDto,
} from './dto/patients.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private async createAuditLog(
    tenantId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  async createPatient(tenantId: string, dto: CreatePatientDto, userId: string) {
    const existingPatient = await this.prisma.patient.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existingPatient && dto.email) {
      throw new BadRequestException('Patient with this email already exists');
    }

    const patient = await this.prisma.patient.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        emergencyName: dto.emergencyName,
        emergencyPhone: dto.emergencyPhone,
        emergencyRelation: dto.emergencyRelation,
        bloodType: dto.bloodType,
        allergies: dto.allergies,
        notes: dto.notes,
      },
    });

    await this.createAuditLog(tenantId, userId, 'CREATE_PATIENT', 'Patient', patient.id, {
      name: `${patient.firstName} ${patient.lastName}`,
    });

    return patient;
  }

  async updatePatient(tenantId: string, patientId: string, dto: UpdatePatientDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    await this.createAuditLog(tenantId, userId, 'UPDATE_PATIENT', 'Patient', patientId, {
      changes: Object.keys(dto),
    });

    return updated;
  }

  async deactivatePatient(tenantId: string, patientId: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });

    await this.createAuditLog(tenantId, userId, 'DEACTIVATE_PATIENT', 'Patient', patientId);

    return updated;
  }

  async getPatient(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        staffAssignments: {
          include: {
            staff: {
              include: { user: true },
            },
          },
        },
        medicalReports: {
          orderBy: { reportDate: 'desc' },
        },
        medicines: {
          orderBy: { startDate: 'desc' },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async getPatients(tenantId: string, query: PatientQueryDto) {
    const where: any = { tenantId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take: query.limit || 50,
        skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
        include: {
          staffAssignments: {
            include: {
              staff: {
                include: { user: true },
              },
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      total,
      page: query.page || 1,
      limit: query.limit || 50,
      totalPages: Math.ceil(total / (query.limit || 50)),
    };
  }

  async addMedicalReport(tenantId: string, patientId: string, dto: MedicalReportDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const report = await this.prisma.medicalReport.create({
      data: {
        patientId,
        reportDate: new Date(dto.reportDate),
        doctorName: dto.doctorName,
        diagnosis: dto.diagnosis,
        treatment: dto.treatment,
        notes: dto.notes,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        isApproved: false,
      },
    });

    await this.createAuditLog(tenantId, userId, 'ADD_MEDICAL_REPORT', 'MedicalReport', report.id, {
      patientId,
      doctorName: dto.doctorName,
    });

    return report;
  }

  async approveMedicalReport(
    tenantId: string,
    reportId: string,
    dto: ApproveMedicalReportDto,
    userId: string,
  ) {
    const report = await this.prisma.medicalReport.findFirst({
      where: { id: reportId },
      include: { patient: true },
    });

    if (!report) {
      throw new NotFoundException('Medical report not found');
    }

    if (report.patient.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    if (report.immutable) {
      throw new BadRequestException('This report has been approved and cannot be modified');
    }

    const updated = await this.prisma.medicalReport.update({
      where: { id: reportId },
      data: {
        isApproved: dto.isApproved,
        approvedAt: dto.isApproved ? new Date() : null,
        approvedBy: dto.isApproved ? userId : null,
        immutable: dto.isApproved,
      },
    });

    await this.createAuditLog(tenantId, userId, dto.isApproved ? 'APPROVE_REPORT' : 'REJECT_REPORT', 'MedicalReport', reportId);

    return updated;
  }

  async getMedicalReports(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.medicalReport.findMany({
      where: { patientId },
      orderBy: { reportDate: 'desc' },
    });
  }

  async addMedicine(tenantId: string, patientId: string, dto: MedicineDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const medicine = await this.prisma.medicineHistory.create({
      data: {
        patientId,
        medicineName: dto.medicineName,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        prescribedBy: dto.prescribedBy,
        notes: dto.notes,
        status: 'active',
      },
    });

    await this.createAuditLog(tenantId, userId, 'ADD_MEDICINE', 'MedicineHistory', medicine.id, {
      patientId,
      medicineName: dto.medicineName,
    });

    return medicine;
  }

  async updateMedicine(tenantId: string, medicineId: string, dto: UpdateMedicineDto, userId: string) {
    const medicine = await this.prisma.medicineHistory.findFirst({
      where: { id: medicineId },
      include: { patient: true },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine record not found');
    }

    if (medicine.patient.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.medicineHistory.update({
      where: { id: medicineId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    await this.createAuditLog(tenantId, userId, 'UPDATE_MEDICINE', 'MedicineHistory', medicineId, {
      changes: Object.keys(dto),
    });

    return updated;
  }

  async stopMedicine(tenantId: string, medicineId: string, userId: string, reason?: string) {
    const medicine = await this.prisma.medicineHistory.findFirst({
      where: { id: medicineId },
      include: { patient: true },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine record not found');
    }

    if (medicine.patient.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.medicineHistory.update({
      where: { id: medicineId },
      data: {
        status: 'stopped',
        endDate: new Date(),
        notes: reason ? `${medicine.notes || ''}\nStopped: ${reason}` : medicine.notes,
      },
    });

    await this.createAuditLog(tenantId, userId, 'STOP_MEDICINE', 'MedicineHistory', medicineId, { reason });

    return updated;
  }

  async getMedicines(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.medicineHistory.findMany({
      where: { patientId },
      orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
    });
  }

  async createAppointment(tenantId: string, dto: AppointmentDto, userId: string) {
    if (dto.staffId) {
      const staff = await this.prisma.employee.findFirst({
        where: { id: dto.staffId, tenantId },
      });

      if (!staff) {
        throw new NotFoundException('Staff member not found');
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        appointmentDate: new Date(dto.appointmentDate),
        duration: dto.duration,
        appointmentType: dto.appointmentType,
        staffId: dto.staffId,
        reason: dto.reason,
        notes: dto.notes,
        status: 'scheduled',
      },
      include: {
        patient: true,
        staff: {
          include: { user: true },
        },
      },
    });

    await this.createAuditLog(tenantId, userId, 'CREATE_APPOINTMENT', 'Appointment', appointment.id, {
      patientId: dto.patientId,
      appointmentType: dto.appointmentType,
    });

    return appointment;
  }

  async createPatientAppointment(tenantId: string, patientId: string, dto: AppointmentDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (dto.staffId) {
      const staff = await this.prisma.employee.findFirst({
        where: { id: dto.staffId, tenantId },
      });

      if (!staff) {
        throw new NotFoundException('Staff member not found');
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        patientId,
        appointmentDate: new Date(dto.appointmentDate),
        duration: dto.duration,
        appointmentType: dto.appointmentType,
        staffId: dto.staffId,
        reason: dto.reason,
        notes: dto.notes,
        status: 'scheduled',
      },
      include: {
        patient: true,
        staff: {
          include: { user: true },
        },
      },
    });

    await this.createAuditLog(tenantId, userId, 'CREATE_APPOINTMENT', 'Appointment', appointment.id, {
      patientId,
      appointmentType: dto.appointmentType,
    });

    return appointment;
  }

  async updateAppointment(tenantId: string, appointmentId: string, dto: UpdateAppointmentDto, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'completed' || appointment.status === 'canceled') {
      throw new BadRequestException('Cannot update a completed or canceled appointment');
    }

    if (dto.staffId) {
      const staff = await this.prisma.employee.findFirst({
        where: { id: dto.staffId, tenantId },
      });

      if (!staff) {
        throw new NotFoundException('Staff member not found');
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...dto,
        appointmentDate: dto.appointmentDate ? new Date(dto.appointmentDate) : undefined,
      },
      include: {
        patient: true,
        staff: {
          include: { user: true },
        },
      },
    });

    await this.createAuditLog(tenantId, userId, 'UPDATE_APPOINTMENT', 'Appointment', appointmentId, {
      changes: Object.keys(dto),
    });

    return updated;
  }

  async cancelAppointment(tenantId: string, appointmentId: string, reason: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'canceled') {
      throw new BadRequestException('Appointment is already canceled');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'canceled',
        cancelReason: reason,
      },
    });

    await this.createAuditLog(tenantId, userId, 'CANCEL_APPOINTMENT', 'Appointment', appointmentId, { reason });

    return updated;
  }

  async getAppointments(tenantId: string, query: AppointmentQueryDto) {
    const where: any = { tenantId };

    if (query.startDate && query.endDate) {
      where.appointmentDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        staff: {
          include: { user: true },
        },
      },
      orderBy: { appointmentDate: 'asc' },
      take: query.limit || 50,
      skip: query.page ? (query.page - 1) * (query.limit || 50) : 0,
    });

    const total = await this.prisma.appointment.count({ where });

    return {
      data: appointments,
      total,
      page: query.page || 1,
      limit: query.limit || 50,
      totalPages: Math.ceil(total / (query.limit || 50)),
    };
  }

  async getPatientAppointments(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        staff: {
          include: { user: true },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async assignStaff(tenantId: string, patientId: string, dto: AssignStaffDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const staff = await this.prisma.employee.findFirst({
      where: { id: dto.staffId, tenantId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const existing = await this.prisma.patientStaff.findFirst({
      where: { patientId, staffId: dto.staffId },
    });

    if (existing) {
      throw new BadRequestException('Staff member is already assigned to this patient');
    }

    if (dto.isPrimary) {
      await this.prisma.patientStaff.updateMany({
        where: { patientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const assignment = await this.prisma.patientStaff.create({
      data: {
        patientId,
        staffId: dto.staffId,
        isPrimary: dto.isPrimary || false,
        notes: dto.notes,
      },
      include: {
        patient: true,
        staff: {
          include: { user: true },
        },
      },
    });

    await this.createAuditLog(tenantId, userId, 'ASSIGN_STAFF', 'PatientStaff', assignment.id, {
      patientId,
      staffId: dto.staffId,
      isPrimary: dto.isPrimary,
    });

    return assignment;
  }

  async removeStaff(tenantId: string, patientId: string, staffId: string, userId: string) {
    const assignment = await this.prisma.patientStaff.findFirst({
      where: { patientId, staffId },
      include: { patient: true },
    });

    if (!assignment) {
      throw new NotFoundException('Staff assignment not found');
    }

    if (assignment.patient.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.patientStaff.delete({
      where: { id: assignment.id },
    });

    await this.createAuditLog(tenantId, userId, 'REMOVE_STAFF', 'PatientStaff', assignment.id, {
      patientId,
      staffId,
    });

    return { success: true };
  }

  async getPatientTimeline(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const [medicalReports, medicines, appointments] = await Promise.all([
      this.prisma.medicalReport.findMany({
        where: { patientId },
        orderBy: { reportDate: 'desc' },
        take: 10,
      }),
      this.prisma.medicineHistory.findMany({
        where: { patientId },
        orderBy: { startDate: 'desc' },
        take: 10,
      }),
      this.prisma.appointment.findMany({
        where: { patientId },
        orderBy: { appointmentDate: 'desc' },
        take: 10,
      }),
    ]);

    const timeline = [
      ...medicalReports.map((r) => ({
        type: 'medical_report',
        id: r.id,
        date: r.reportDate,
        title: `Medical Report - ${r.doctorName}`,
        description: r.diagnosis || r.notes,
        data: r,
      })),
      ...medicines.map((m) => ({
        type: 'medicine',
        id: m.id,
        date: m.startDate,
        title: `Started ${m.medicineName}`,
        description: `${m.dosage} - ${m.frequency}`,
        data: m,
      })),
      ...appointments.map((a) => ({
        type: 'appointment',
        id: a.id,
        date: a.appointmentDate,
        title: `${a.appointmentType} Appointment`,
        description: a.reason || a.status,
        data: a,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  async getAllStaff(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, onboardingStatus: 'employee_active' },
      include: { user: true },
      orderBy: { user: { lastName: 'asc' } },
    });
  }
}
