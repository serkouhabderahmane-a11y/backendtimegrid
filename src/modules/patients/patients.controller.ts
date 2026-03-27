import { Controller, Get, Post, Patch, Delete, UseGuards, Request, Param, Body, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async createPatient(@Request() req, @Body() dto: CreatePatientDto) {
    return this.patientsService.createPatient(req.user.tenantId, dto, req.user.id);
  }

  @Get()
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getPatients(@Request() req, @Query() query: PatientQueryDto) {
    return this.patientsService.getPatients(req.user.tenantId, query);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getPatient(@Request() req, @Param('id') id: string) {
    return this.patientsService.getPatient(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async updatePatient(@Request() req, @Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.updatePatient(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async deactivatePatient(@Request() req, @Param('id') id: string) {
    return this.patientsService.deactivatePatient(req.user.tenantId, id, req.user.id);
  }

  @Get(':id/timeline')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getPatientTimeline(@Request() req, @Param('id') id: string) {
    return this.patientsService.getPatientTimeline(req.user.tenantId, id);
  }

  @Post(':id/medical-reports')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async addMedicalReport(@Request() req, @Param('id') id: string, @Body() dto: MedicalReportDto) {
    return this.patientsService.addMedicalReport(req.user.tenantId, id, dto, req.user.id);
  }

  @Get(':id/medical-reports')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getMedicalReports(@Request() req, @Param('id') id: string) {
    return this.patientsService.getMedicalReports(req.user.tenantId, id);
  }

  @Patch('medical-reports/:reportId/approve')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async approveMedicalReport(
    @Request() req,
    @Param('reportId') reportId: string,
    @Body() dto: ApproveMedicalReportDto,
  ) {
    return this.patientsService.approveMedicalReport(req.user.tenantId, reportId, dto, req.user.id);
  }

  @Post(':id/medicines')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async addMedicine(@Request() req, @Param('id') id: string, @Body() dto: MedicineDto) {
    return this.patientsService.addMedicine(req.user.tenantId, id, dto, req.user.id);
  }

  @Patch('medicines/:medicineId')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async updateMedicine(
    @Request() req,
    @Param('medicineId') medicineId: string,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.patientsService.updateMedicine(req.user.tenantId, medicineId, dto, req.user.id);
  }

  @Post('medicines/:medicineId/stop')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async stopMedicine(@Request() req, @Param('medicineId') medicineId: string, @Body() body: { reason?: string }) {
    return this.patientsService.stopMedicine(req.user.tenantId, medicineId, req.user.id, body.reason);
  }

  @Get(':id/medicines')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getMedicines(@Request() req, @Param('id') id: string) {
    return this.patientsService.getMedicines(req.user.tenantId, id);
  }

  @Post(':id/appointments')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async createAppointment(@Request() req, @Param('id') id: string, @Body() dto: AppointmentDto) {
    return this.patientsService.createPatientAppointment(req.user.tenantId, id, dto, req.user.id);
  }

  @Get(':id/appointments')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getPatientAppointments(@Request() req, @Param('id') id: string) {
    return this.patientsService.getPatientAppointments(req.user.tenantId, id);
  }

  @Get('appointments/all')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAppointments(@Request() req, @Query() query: AppointmentQueryDto) {
    return this.patientsService.getAppointments(req.user.tenantId, query);
  }

  @Patch('appointments/:appointmentId')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async updateAppointment(
    @Request() req,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.patientsService.updateAppointment(req.user.tenantId, appointmentId, dto, req.user.id);
  }

  @Post('appointments/:appointmentId/cancel')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async cancelAppointment(
    @Request() req,
    @Param('appointmentId') appointmentId: string,
    @Body() body: { reason: string },
  ) {
    return this.patientsService.cancelAppointment(req.user.tenantId, appointmentId, body.reason, req.user.id);
  }

  @Post(':id/staff')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async assignStaff(@Request() req, @Param('id') id: string, @Body() dto: AssignStaffDto) {
    return this.patientsService.assignStaff(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id/staff/:staffId')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async removeStaff(@Request() req, @Param('id') id: string, @Param('staffId') staffId: string) {
    return this.patientsService.removeStaff(req.user.tenantId, id, staffId, req.user.id);
  }

  @Get('staff/all')
  @Roles('admin', 'hr', 'manager', 'employee')
  @UseGuards(RolesGuard)
  async getAllStaff(@Request() req) {
    return this.patientsService.getAllStaff(req.user.tenantId);
  }
}
