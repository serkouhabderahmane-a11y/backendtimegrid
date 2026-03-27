import { MedicineStatus, AppointmentStatus } from '@prisma/client';
export declare class CreatePatientDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    bloodType?: string;
    allergies?: string;
    notes?: string;
}
export declare class UpdatePatientDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    bloodType?: string;
    allergies?: string;
    notes?: string;
    isActive?: boolean;
}
export declare class MedicalReportDto {
    reportDate: string;
    doctorName: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
}
export declare class ApproveMedicalReportDto {
    isApproved: boolean;
}
export declare class MedicineDto {
    medicineName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
    notes?: string;
}
export declare class UpdateMedicineDto {
    medicineName?: string;
    dosage?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    prescribedBy?: string;
    status?: MedicineStatus;
    notes?: string;
}
export declare class AppointmentDto {
    patientId: string;
    appointmentDate: string;
    duration: number;
    appointmentType: string;
    staffId?: string;
    reason?: string;
    notes?: string;
}
export declare class UpdateAppointmentDto {
    appointmentDate?: string;
    duration?: number;
    appointmentType?: string;
    staffId?: string;
    reason?: string;
    notes?: string;
    status?: AppointmentStatus;
    cancelReason?: string;
}
export declare class PatientQueryDto {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class AppointmentQueryDto {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    staffId?: string;
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
}
export declare class AssignStaffDto {
    staffId: string;
    isPrimary?: boolean;
    notes?: string;
}
