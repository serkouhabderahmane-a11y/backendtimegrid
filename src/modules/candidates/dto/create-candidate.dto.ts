import { IsEmail, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { EMPLOYMENT_TYPES } from '../../../common/constants/enums';

export class CreateCandidateDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsEnum(EMPLOYMENT_TYPES)
  employmentType: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
