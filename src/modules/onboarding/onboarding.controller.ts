import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('token/:secureToken')
  async getByToken(@Param('secureToken') secureToken: string) {
    return this.onboardingService.getOnboardingByToken(secureToken);
  }

  @Post(':onboardingId/tasks/:taskId/draft')
  async saveDraft(
    @Param('onboardingId') onboardingId: string,
    @Param('taskId') taskId: string,
    @Body('tenantId') tenantId: string,
    @Body('submissionData') submissionData: Record<string, any>,
  ) {
    return this.onboardingService.saveTaskDraft(onboardingId, taskId, tenantId, submissionData);
  }

  @Post(':onboardingId/tasks/:taskId/submit')
  async submitTask(
    @Param('onboardingId') onboardingId: string,
    @Param('taskId') taskId: string,
    @Body('tenantId') tenantId: string,
    @Body('submissionData') submissionData: Record<string, any>,
  ) {
    return this.onboardingService.submitTask(onboardingId, taskId, tenantId, submissionData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Post(':onboardingId/tasks/:taskId/approve')
  async approveTask(
    @Param('onboardingId') onboardingId: string,
    @Param('taskId') taskId: string,
    @Body('tenantId') tenantId: string,
    @Request() req,
    @Body('comment') comment?: string,
  ) {
    return this.onboardingService.approveTask(onboardingId, taskId, tenantId, req.user.id, comment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Post(':onboardingId/tasks/:taskId/reject')
  async rejectTask(
    @Param('onboardingId') onboardingId: string,
    @Param('taskId') taskId: string,
    @Body('tenantId') tenantId: string,
    @Request() req,
    @Body('comment') comment: string,
  ) {
    return this.onboardingService.rejectTask(onboardingId, taskId, tenantId, req.user.id, comment);
  }

  @Get(':onboardingId/progress')
  async getProgress(
    @Param('onboardingId') onboardingId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.onboardingService.getProgress(onboardingId, tenantId);
  }
}
