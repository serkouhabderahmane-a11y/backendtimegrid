import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { AuditLogger } from '../audit-logs/audit-logger.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [ConfigModule, OnboardingModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, AuditLogger, EmailService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
