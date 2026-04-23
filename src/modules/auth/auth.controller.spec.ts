import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /auth/demo', () => {
    it('should return demo credentials', () => {
      const result = controller.getDemoCredentials();

      expect(result.demo).toBe(true);
      expect(result.accounts).toBeDefined();
      expect(result.accounts.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = {
        success: true,
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user_id: 'user-id',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong' };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const expectedResult = {
        accessToken: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh('valid-refresh-token');

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw error for invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(
        controller.refresh('invalid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'employee',
          tenantId: 'tenant-id',
        },
      };

      const result = await controller.me(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('POST /auth/tenants/:tenantId/register', () => {
    it('should register user for specific tenant', async () => {
      const tenantId = 'tenant-id';
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const expectedResult = {
        success: true,
        user_id: 'user-id',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(tenantId, createUserDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        createUserDto,
        tenantId,
      );
    });
  });
});
