"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const onboarding_service_1 = require("./onboarding.service");
const onboarding_controller_1 = require("./onboarding.controller");
const onboarding_state_machine_service_1 = require("./onboarding-state-machine.service");
const audit_logger_service_1 = require("../audit-logs/audit-logger.service");
const email_service_1 = require("../email/email.service");
let OnboardingModule = class OnboardingModule {
};
exports.OnboardingModule = OnboardingModule;
exports.OnboardingModule = OnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        controllers: [onboarding_controller_1.OnboardingController],
        providers: [onboarding_service_1.OnboardingService, onboarding_state_machine_service_1.OnboardingStateMachine, audit_logger_service_1.AuditLogger, email_service_1.EmailService],
        exports: [onboarding_service_1.OnboardingService, onboarding_state_machine_service_1.OnboardingStateMachine, email_service_1.EmailService],
    })
], OnboardingModule);
//# sourceMappingURL=onboarding.module.js.map