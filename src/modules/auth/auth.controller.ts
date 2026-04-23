import { Controller, Post, Body, Get, UseGuards, Request, Param, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('demo')
  getDemoCredentials() {
    return {
      demo: true,
      accounts: [
        {
          role: 'admin',
          email: process.env.DEMO_EMAIL || 'demo@timegrid.app',
          passwordHint: 'Use environment variable DEMO_PASSWORD or default: demo123',
        },
        {
          role: 'hr',
          email: process.env.DEMO_HR_EMAIL || 'hr@timegrid.app',
          passwordHint: 'Use environment variable DEMO_HR_PASSWORD or default: hr123',
        },
        {
          role: 'employee',
          email: process.env.DEMO_EMPLOYEE_EMAIL || 'employee@timegrid.app',
          passwordHint: 'Use environment variable DEMO_EMPLOYEE_PASSWORD or default: employee123',
        },
      ],
    };
  }

  @Post('tenants/:tenantId/register')
  async register(@Param('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.authService.register(dto, tenantId);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return req.user;
  }
}
