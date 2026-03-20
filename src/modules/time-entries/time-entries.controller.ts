import { Controller, Post, Get, UseGuards, Request, Query, Param, Body } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Post('clock-in')
  async clockIn(@Request() req) {
    return this.timeEntriesService.clockIn(req.user.id, req.user.tenantId);
  }

  @Post('clock-out')
  async clockOut(@Request() req) {
    return this.timeEntriesService.clockOut(req.user.id, req.user.tenantId);
  }

  @Get('today')
  async getTodayEntry(@Request() req) {
    return this.timeEntriesService.getTodayEntry(req.user.id, req.user.tenantId);
  }

  @Get()
  async getEntries(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeEntriesService.getEntries(
      req.user.id,
      req.user.tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('admin/all')
  @Roles('admin', 'hr', 'manager')
  async getAllTimesheets(
    @Request() req,
    @Query('payPeriodId') payPeriodId?: string,
  ) {
    return this.timeEntriesService.getAllTimesheets(req.user.tenantId, payPeriodId);
  }

  @Post('admin/assign')
  @Roles('admin', 'hr', 'manager')
  async assignToPayPeriod(
    @Request() req,
    @Body() body: { timesheetId: string; payPeriodId: string },
  ) {
    return this.timeEntriesService.assignToPayPeriod(
      req.user.tenantId,
      body.timesheetId,
      body.payPeriodId,
    );
  }

  @Post(':id/approve')
  @Roles('admin', 'manager')
  async approveTimesheet(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.timeEntriesService.approveTimesheet(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/reject')
  @Roles('admin', 'manager')
  async rejectTimesheet(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.timeEntriesService.rejectTimesheet(req.user.tenantId, id, req.user.id, body.reason);
  }

  @Post(':id/review')
  @Roles('admin', 'hr')
  async reviewTimesheet(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.timeEntriesService.reviewTimesheet(req.user.tenantId, id, req.user.id);
  }

  @Get('pay-period/:payPeriodId')
  @Roles('admin', 'hr', 'manager')
  async getTimesheetsForPayPeriod(
    @Request() req,
    @Param('payPeriodId') payPeriodId: string,
  ) {
    return this.timeEntriesService.getTimesheetsForPayPeriod(req.user.tenantId, payPeriodId);
  }
}
