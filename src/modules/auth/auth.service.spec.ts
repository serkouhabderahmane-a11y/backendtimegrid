import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/config.module';
import * as bcrypt from 'bcryptjs';

const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
  },
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockJwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useFactory: () => mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const tenantId = 'test-tenant-id';
      const mockUser = {
        id: 'user-id',
        tenantId,
        email: 'new@example.com',
        passwordHash: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee' as const,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.register(
        {
          email: 'new@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        },
        tenantId,
      );

      expect(result.success).toBe(true);
      expect(result.user_id).toBe(mockUser.id);
      expect(result.token).toBe('test-jwt-token');
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register(
          {
            email: 'existing@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
          },
          'tenant-id',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'user-id',
        tenantId: 'tenant-id',
        email: 'test@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee' as const,
        isActive: true,
        tenant: { id: 'tenant-id', name: 'Test Tenant', slug: 'test' },
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe('test-jwt-token');
      expect(result.user_id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException for invalid email (generic error - no email leakage)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should FAIL - inactive user must NOT get token', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash,
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully and invalidate old token', async () => {
      const mockTokenRecord = {
        id: 'token-id',
        userId: 'user-id',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'employee',
        tenantId: 'tenant-id',
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.update.mockResolvedValue({ ...mockTokenRecord, revokedAt: new Date() });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.refreshToken).toBe('test-jwt-token');
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-id' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should FAIL - reused refresh token (rotation)', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        revokedAt: new Date(Date.now() - 1000),
      });

      await expect(
        authService.refreshToken('reused-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should FAIL - expired refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
      });

      await expect(
        authService.refreshToken('expired-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should FAIL - invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const mockPayload = { sub: 'user-id', email: 'test@example.com', role: 'employee' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await authService.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.validateToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
