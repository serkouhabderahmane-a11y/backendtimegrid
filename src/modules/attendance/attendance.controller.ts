import { Controller, Post, Get, Patch, UseGuards, Request, Query, Param, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClockInDto, ClockOutDto, AttendanceQueryDto, AdjustmentDto } from './dto/attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(@Request() req, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(req.user.id, req.user.tenantId, dto, req);
  }

  @Post('clock-out')
  async clockOut(@Request() req, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(req.user.id, req.user.tenantId, dto, req);
  }

  @Get('today')
  async getTodayAttendance(@Request() req) {
    return this.attendanceService.getTodayAttendance(req.user.id, req.user.tenantId);
  }

  @Get('my-attendance')
  async getMyAttendance(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getMyAttendance(req.user.id, req.user.tenantId, query);
  }

  @Get('my-stats')
  async getMyStats(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getMyStats(req.user.id, req.user.tenantId, query);
  }

  @Get('admin/all')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAdminAttendance(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getAdminAttendance(req.user.tenantId, query);
  }

  @Get('admin/stats')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAdminStats(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getAdminStats(req.user.tenantId, query);
  }

  @Get('admin/export')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async exportAttendance(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.exportAttendance(req.user.tenantId, query);
  }

  @Get('admin/employees')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAllEmployees(@Request() req) {
    return this.attendanceService.getAllEmployees(req.user.tenantId);
  }

  @Get('admin/departments')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAllDepartments(@Request() req) {
    return this.attendanceService.getAllDepartments(req.user.tenantId);
  }

  @Get('admin/employee/:employeeId')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getEmployeeAttendance(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.getEmployeeAttendance(req.user.tenantId, employeeId, query);
  }

  @Patch('admin/:id/adjust')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async adjustAttendance(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AdjustmentDto,
  ) {
    return this.attendanceService.adjustAttendance(req.user.tenantId, id, dto, req.user.id, req);
  }

  @Get(':id/adjustments')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAdjustments(@Request() req, @Param('id') id: string) {
    return this.attendanceService.getAdjustments(req.user.tenantId, id);
  }

  @Get(':id/logs')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAttendanceLogs(@Request() req, @Param('id') id: string) {
    return this.attendanceService.getAttendanceLogs(req.user.tenantId, id);
  }
}
