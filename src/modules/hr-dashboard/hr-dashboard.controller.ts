import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { HrDashboardService } from './hr-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';

@Controller('tenants/:tenantId/hr-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class HrDashboardController {
  constructor(private hrDashboardService: HrDashboardService) {}

  @Get('stats')
  async getStats(@Param('tenantId') tenantId: string) {
    return this.hrDashboardService.getDashboardStats(tenantId);
  }

  @Get('candidates/by-state/:state')
  async getCandidatesByState(
    @Param('tenantId') tenantId: string,
    @Param('state') state: string,
  ) {
    return this.hrDashboardService.getCandidatesByState(tenantId, state);
  }

  @Get('approvals')
  async getApprovalQueue(@Param('tenantId') tenantId: string) {
    return this.hrDashboardService.getApprovalQueue(tenantId);
  }

  @Get('rejected-tasks')
  async getRejectedTasks(@Param('tenantId') tenantId: string) {
    return this.hrDashboardService.getRejectedTasks(tenantId);
  }

  @Get('documents/expired')
  async getExpiredDocuments(@Param('tenantId') tenantId: string) {
    return this.hrDashboardService.getExpiredDocuments(tenantId);
  }

  @Get('documents/expiring')
  async getExpiringDocuments(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.hrDashboardService.getExpiringDocuments(tenantId, days ? parseInt(days) : 30);
  }
}
