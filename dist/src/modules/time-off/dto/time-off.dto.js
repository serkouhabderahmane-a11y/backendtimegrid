"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustBalanceDto = exports.UpdateBalanceDto = exports.CreateBalanceDto = exports.TimeOffQueryDto = exports.CancelTimeOffDto = exports.ReviewTimeOffDto = exports.UpdateTimeOffRequestDto = exports.CreateTimeOffRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateTimeOffRequestDto {
    type;
    startDate;
    endDate;
    reason;
}
exports.CreateTimeOffRequestDto = CreateTimeOffRequestDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TimeOffType),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "reason", void 0);
class UpdateTimeOffRequestDto {
    status;
    reviewComment;
}
exports.UpdateTimeOffRequestDto = UpdateTimeOffRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TimeOffStatus),
    __metadata("design:type", String)
], UpdateTimeOffRequestDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTimeOffRequestDto.prototype, "reviewComment", void 0);
class ReviewTimeOffDto {
    status;
    comment;
}
exports.ReviewTimeOffDto = ReviewTimeOffDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TimeOffStatus),
    __metadata("design:type", String)
], ReviewTimeOffDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewTimeOffDto.prototype, "comment", void 0);
class CancelTimeOffDto {
    reason;
}
exports.CancelTimeOffDto = CancelTimeOffDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelTimeOffDto.prototype, "reason", void 0);
class TimeOffQueryDto {
    startDate;
    endDate;
    type;
    status;
    employeeId;
    page = 1;
    limit = 50;
}
exports.TimeOffQueryDto = TimeOffQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TimeOffQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TimeOffQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TimeOffType),
    __metadata("design:type", String)
], TimeOffQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TimeOffStatus),
    __metadata("design:type", String)
], TimeOffQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TimeOffQueryDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => class_validator_1.IsInt),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TimeOffQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => class_validator_1.IsInt),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TimeOffQueryDto.prototype, "limit", void 0);
class CreateBalanceDto {
    type;
    totalDays;
    year;
    carryOverDays;
}
exports.CreateBalanceDto = CreateBalanceDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TimeOffType),
    __metadata("design:type", String)
], CreateBalanceDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBalanceDto.prototype, "totalDays", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBalanceDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBalanceDto.prototype, "carryOverDays", void 0);
class UpdateBalanceDto {
    totalDays;
    usedDays;
    pendingDays;
    carryOverDays;
}
exports.UpdateBalanceDto = UpdateBalanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "totalDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "usedDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "pendingDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "carryOverDays", void 0);
class AdjustBalanceDto {
    totalDays;
    usedDays;
    carryOverDays;
    reason;
}
exports.AdjustBalanceDto = AdjustBalanceDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdjustBalanceDto.prototype, "totalDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdjustBalanceDto.prototype, "usedDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdjustBalanceDto.prototype, "carryOverDays", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustBalanceDto.prototype, "reason", void 0);
//# sourceMappingURL=time-off.dto.js.map