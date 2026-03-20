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

  @Get('steps/:secureToken')
  async getOnboardingSteps(@Param('secureToken') secureToken: string) {
    return this.onboardingService.getOnboardingSteps(secureToken);
  }

  @Post('steps/personal-info')
  async submitPersonalInfo(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body() data: {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      emergencyContact: string;
      emergencyPhone: string;
    },
  ) {
    return this.onboardingService.submitPersonalInfo(onboardingId, tenantId, data);
  }

  @Post('steps/offer-letter')
  async createOfferLetterEnvelope(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body() data: { action: 'view' | 'accept' | 'reject' },
  ) {
    return this.onboardingService.createOfferLetterEnvelope(onboardingId, tenantId, data);
  }

  @Post('steps/sign-offer-letter')
  async signOfferLetter(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body() data: {
      signatureType: 'typed' | 'handwritten';
      typedName?: string;
      signatureImageUrl?: string;
    },
  ) {
    return this.onboardingService.signOfferLetter(onboardingId, tenantId, data);
  }

  @Post('steps/documents')
  async uploadDocuments(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body() documents: Array<{
      name: string;
      type: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    }>,
  ) {
    return this.onboardingService.uploadDocuments(onboardingId, tenantId, documents);
  }

  @Post('steps/training/progress')
  async updateTrainingProgress(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body('watchProgress') watchProgress: number,
  ) {
    return this.onboardingService.updateTrainingProgress(onboardingId, tenantId, watchProgress);
  }

  @Post('steps/training/acknowledge')
  async acknowledgeTraining(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body('signatureHash') signatureHash: string,
  ) {
    return this.onboardingService.acknowledgeTraining(onboardingId, tenantId, signatureHash);
  }

  @Post('steps/signature')
  async submitFinalSignature(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
    @Body() data: {
      signatureType: 'typed' | 'handwritten';
      typedName?: string;
      signatureImageUrl?: string;
    },
  ) {
    return this.onboardingService.submitFinalSignature(onboardingId, tenantId, data);
  }

  @Post('steps/complete')
  async completeOnboarding(
    @Body('onboardingId') onboardingId: string,
    @Body('tenantId') tenantId: string,
  ) {
    return this.onboardingService.completeOnboarding(onboardingId, tenantId);
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
