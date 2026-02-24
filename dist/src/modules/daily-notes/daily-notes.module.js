"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyNotesModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const daily_notes_service_1 = require("./daily-notes.service");
const daily_notes_controller_1 = require("./daily-notes.controller");
let DailyNotesModule = class DailyNotesModule {
};
exports.DailyNotesModule = DailyNotesModule;
exports.DailyNotesModule = DailyNotesModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        controllers: [daily_notes_controller_1.DailyNotesController],
        providers: [daily_notes_service_1.DailyNotesService],
        exports: [daily_notes_service_1.DailyNotesService],
    })
], DailyNotesModule);
//# sourceMappingURL=daily-notes.module.js.map