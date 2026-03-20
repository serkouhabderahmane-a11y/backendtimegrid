"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config/config.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const candidates_module_1 = require("./modules/candidates/candidates.module");
const onboarding_module_1 = require("./modules/onboarding/onboarding.module");
const time_entries_module_1 = require("./modules/time-entries/time-entries.module");
const hr_dashboard_module_1 = require("./modules/hr-dashboard/hr-dashboard.module");
const audit_logger_service_1 = require("./modules/audit-logs/audit-logger.service");
const email_service_1 = require("./modules/email/email.service");
const payroll_module_1 = require("./modules/payroll/payroll.module");
const daily_notes_module_1 = require("./modules/daily-notes/daily-notes.module");
const mar_module_1 = require("./modules/mar/mar.module");
const social_feed_module_1 = require("./modules/social-feed/social-feed.module");
const chat_module_1 = require("./modules/chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            candidates_module_1.CandidatesModule,
            onboarding_module_1.OnboardingModule,
            time_entries_module_1.TimeEntriesModule,
            hr_dashboard_module_1.HrDashboardModule,
            payroll_module_1.PayrollModule,
            daily_notes_module_1.DailyNotesModule,
            mar_module_1.MarModule,
            social_feed_module_1.SocialFeedModule,
            chat_module_1.ChatModule,
        ],
        providers: [audit_logger_service_1.AuditLogger, email_service_1.EmailService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map