"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const hr_dashboard_service_1 = require("./hr-dashboard.service");
const hr_dashboard_controller_1 = require("./hr-dashboard.controller");
let HrDashboardModule = class HrDashboardModule {
};
exports.HrDashboardModule = HrDashboardModule;
exports.HrDashboardModule = HrDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        controllers: [hr_dashboard_controller_1.HrDashboardController],
        providers: [hr_dashboard_service_1.HrDashboardService],
        exports: [hr_dashboard_service_1.HrDashboardService],
    })
], HrDashboardModule);
//# sourceMappingURL=hr-dashboard.module.js.map