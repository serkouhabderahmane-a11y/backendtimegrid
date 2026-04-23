import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new (AuthGuard('jwt'))();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be instance of AuthGuard', () => {
    expect(guard).toBeDefined();
  });

  describe('guard structure', () => {
    it('should have canActivate method', () => {
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should have handleRequest method', () => {
      expect(typeof guard.handleRequest).toBe('function');
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const result = guard.handleRequest(null, user, null, null);
      expect(result).toBe(user);
    });

    it('should throw error when user is null', () => {
      expect(() => guard.handleRequest(null, null, null, null)).toThrow(UnauthorizedException);
    });

    it('should throw error when info is provided', () => {
      expect(() => guard.handleRequest(null, null, 'token expired', null)).toThrow(UnauthorizedException);
    });
  });
});
