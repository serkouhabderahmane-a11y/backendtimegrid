import { IsOptional, IsString, IsDateString, IsInt, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class ClockInDto {
  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class ClockOutDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AttendanceQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @Type(() => IsInt)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => IsInt)
  @IsInt()
  limit?: number = 50;
}

export class AdjustmentDto {
  @IsOptional()
  @IsDateString()
  clockIn?: string;

  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @IsOptional()
  @IsInt()
  totalMinutes?: number;

  @IsString()
  reason!: string;
}

export class EmployeeAttendanceStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
