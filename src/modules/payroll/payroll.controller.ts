import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Post('pay-periods')
  @Roles('admin', 'hr', 'manager')
  async createPayPeriod(@Request() req, @Body() body: {
    name: string;
    startDate: string;
    endDate: string;
  }) {
    return this.payrollService.createPayPeriod(req.user.tenantId, req.user.id, {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @Get('pay-periods')
  @Roles('admin', 'hr', 'manager')
  async getPayPeriods(@Request() req) {
    return this.payrollService.getPayPeriods(req.user.tenantId);
  }

  @Get('pay-periods/:id')
  @Roles('admin', 'hr', 'manager')
  async getPayPeriod(@Request() req, @Param('id') id: string) {
    return this.payrollService.getPayPeriod(req.user.tenantId, id);
  }

  @Post('timesheets/:timeEntryId/approve')
  @Roles('admin', 'manager')
  async approveTimesheet(
    @Request() req,
    @Param('timeEntryId') timeEntryId: string,
    @Body() body: { approved: boolean; rejectionReason?: string },
  ) {
    if (!body.approved && !body.rejectionReason) {
      throw new Error('Rejection reason is required when rejecting a timesheet');
    }
    return this.payrollService.approveTimesheet(
      req.user.tenantId,
      req.user.id,
      timeEntryId,
      body,
    );
  }

  @Post('pay-periods/:id/lock')
  @Roles('admin')
  async lockPayPeriod(@Request() req, @Param('id') id: string) {
    return this.payrollService.lockPayPeriod(req.user.tenantId, req.user.id, id);
  }

  @Post('pay-periods/:id/calculate')
  @Roles('admin')
  async calculatePayroll(@Request() req, @Param('id') id: string) {
    return this.payrollService.calculatePayroll(req.user.tenantId, req.user.id, id);
  }

  @Post('pay-periods/:id/export')
  @Roles('admin', 'hr')
  async exportPayroll(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { provider: string; format: 'csv' | 'excel' | 'api' },
  ) {
    return this.payrollService.exportPayroll(
      req.user.tenantId,
      req.user.id,
      id,
      body.provider,
      body.format,
    );
  }

  @Get('audit-logs')
  @Roles('admin')
  async getAuditLogs(
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.payrollService.getAuditLogs(req.user.tenantId, entityType, entityId);
  }
}
