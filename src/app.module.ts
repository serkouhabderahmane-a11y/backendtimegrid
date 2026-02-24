import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module';
import { HrDashboardModule } from './modules/hr-dashboard/hr-dashboard.module';
import { AuditLogger } from './modules/audit-logs/audit-logger.service';
import { EmailService } from './modules/email/email.service';
import { PayrollModule } from './modules/payroll/payroll.module';
import { DailyNotesModule } from './modules/daily-notes/daily-notes.module';
import { MarModule } from './modules/mar/mar.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TenantsModule,
    CandidatesModule,
    OnboardingModule,
    TimeEntriesModule,
    HrDashboardModule,
    PayrollModule,
    DailyNotesModule,
    MarModule,
  ],
  providers: [AuditLogger, EmailService],
})
export class AppModule {}
