import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { USER_ROLES } from '../../../common/constants/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: string;
}
