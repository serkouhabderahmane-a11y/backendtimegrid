import { IsOptional, IsString, IsDateString, IsEnum, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeOffType, TimeOffStatus } from '@prisma/client';

export class CreateTimeOffRequestDto {
  @IsEnum(TimeOffType)
  type!: TimeOffType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateTimeOffRequestDto {
  @IsOptional()
  @IsEnum(TimeOffStatus)
  status?: TimeOffStatus;

  @IsOptional()
  @IsString()
  reviewComment?: string;
}

export class ReviewTimeOffDto {
  @IsEnum(TimeOffStatus)
  status!: TimeOffStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CancelTimeOffDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TimeOffQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TimeOffType)
  type?: TimeOffType;

  @IsOptional()
  @IsEnum(TimeOffStatus)
  status?: TimeOffStatus;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @Type(() => IsInt)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => IsInt)
  @IsInt()
  limit?: number = 50;
}

export class CreateBalanceDto {
  @IsEnum(TimeOffType)
  type!: TimeOffType;

  @IsNumber()
  totalDays!: number;

  @IsInt()
  year!: number;

  @IsOptional()
  @IsNumber()
  carryOverDays?: number;
}

export class UpdateBalanceDto {
  @IsOptional()
  @IsNumber()
  totalDays?: number;

  @IsOptional()
  @IsNumber()
  usedDays?: number;

  @IsOptional()
  @IsNumber()
  pendingDays?: number;

  @IsOptional()
  @IsNumber()
  carryOverDays?: number;
}

export class AdjustBalanceDto {
  @IsNumber()
  totalDays!: number;

  @IsOptional()
  @IsNumber()
  usedDays?: number;

  @IsOptional()
  @IsNumber()
  carryOverDays?: number;

  @IsString()
  reason!: string;
}
