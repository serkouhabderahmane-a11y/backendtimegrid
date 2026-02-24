import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingStateMachine } from './onboarding-state-machine.service';
import { AuditLogger } from '../audit-logs/audit-logger.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [ConfigModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingStateMachine, AuditLogger, EmailService],
  exports: [OnboardingService, OnboardingStateMachine, EmailService],
})
export class OnboardingModule {}
