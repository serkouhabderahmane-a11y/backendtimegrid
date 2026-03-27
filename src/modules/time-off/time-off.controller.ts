import { Controller, Get, Post, Patch, UseGuards, Request, Param, Body, Query } from '@nestjs/common';
import { TimeOffService } from './time-off.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateTimeOffRequestDto,
  ReviewTimeOffDto,
  CancelTimeOffDto,
  TimeOffQueryDto,
  CreateBalanceDto,
  AdjustBalanceDto,
} from './dto/time-off.dto';

@Controller('time-off')
@UseGuards(JwtAuthGuard)
export class TimeOffController {
  constructor(private timeOffService: TimeOffService) {}

  @Post('requests')
  async createRequest(@Request() req, @Body() dto: CreateTimeOffRequestDto) {
    return this.timeOffService.createRequest(req.user.id, req.user.tenantId, dto, req);
  }

  @Get('requests/my')
  async getMyRequests(@Request() req, @Query() query: TimeOffQueryDto) {
    return this.timeOffService.getMyRequests(req.user.id, req.user.tenantId, query);
  }

  @Get('balances/my')
  async getMyBalances(@Request() req) {
    return this.timeOffService.getMyBalances(req.user.id, req.user.tenantId);
  }

  @Post('requests/:id/cancel')
  async cancelRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelTimeOffDto,
  ) {
    return this.timeOffService.cancelMyRequest(req.user.id, req.user.tenantId, id, dto, req);
  }

  @Get('admin/requests')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAdminRequests(@Request() req, @Query() query: TimeOffQueryDto) {
    return this.timeOffService.getAdminRequests(req.user.tenantId, query);
  }

  @Patch('admin/requests/:id/review')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async reviewRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ReviewTimeOffDto,
  ) {
    return this.timeOffService.reviewRequest(req.user.tenantId, id, dto, req.user.id, req);
  }

  @Get('admin/calendar')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getLeaveCalendar(@Request() req, @Query() query: TimeOffQueryDto) {
    return this.timeOffService.getLeaveCalendar(req.user.tenantId, query);
  }

  @Get('admin/stats')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAdminStats(@Request() req, @Query() query: TimeOffQueryDto) {
    return this.timeOffService.getAdminStats(req.user.tenantId, query);
  }

  @Get('admin/employees')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getAllEmployees(@Request() req) {
    return this.timeOffService.getAllEmployees(req.user.tenantId);
  }

  @Get('admin/employees/:employeeId/balances')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getEmployeeBalances(@Request() req, @Param('employeeId') employeeId: string) {
    return this.timeOffService.getEmployeeBalances(req.user.tenantId, employeeId);
  }

  @Post('admin/employees/:employeeId/balances')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async createOrUpdateBalance(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateBalanceDto,
  ) {
    return this.timeOffService.createOrUpdateBalance(req.user.tenantId, employeeId, dto, req.user.id, req);
  }

  @Patch('admin/balances/:balanceId')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async adjustBalance(
    @Request() req,
    @Param('balanceId') balanceId: string,
    @Body() dto: AdjustBalanceDto,
  ) {
    return this.timeOffService.adjustBalance(req.user.tenantId, balanceId, dto, req.user.id, req);
  }

  @Get('requests/:id/logs')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getRequestLogs(@Request() req, @Param('id') id: string) {
    return this.timeOffService.getRequestLogs(req.user.tenantId, id);
  }

  @Get('balances/:balanceId/history')
  @Roles('admin', 'hr', 'manager')
  @UseGuards(RolesGuard)
  async getBalanceHistory(@Request() req, @Param('balanceId') balanceId: string) {
    return this.timeOffService.getBalanceHistory(req.user.tenantId, balanceId);
  }
}
