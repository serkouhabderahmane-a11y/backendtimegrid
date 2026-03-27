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
import { SocialFeedModule } from './modules/social-feed/social-feed.module';
import { ChatModule } from './modules/chat/chat.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PatientsModule } from './modules/patients/patients.module';
import { TimeOffModule } from './modules/time-off/time-off.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { SeedModule } from './modules/seed/seed.module';

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
    SocialFeedModule,
    ChatModule,
    AttendanceModule,
    PatientsModule,
    TimeOffModule,
    HolidaysModule,
    SharingModule,
    SeedModule,
  ],
  providers: [AuditLogger, EmailService],
})
export class AppModule {}
