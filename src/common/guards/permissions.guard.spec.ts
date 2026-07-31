import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { PermissionGuard } from './permissions.guard';

describe('PermissionGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: PermissionGuard;

  function createContext(user?: {
    roles: Array<{ permissions: Array<{ name: string }> }>;
  }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new PermissionGuard(reflector as unknown as Reflector);
  });

  it('returns true when no permissions are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('returns true when required permissions array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('returns false when user is missing', () => {
    reflector.getAllAndOverride.mockReturnValue(['links:read']);

    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('returns true when user has all required permissions', () => {
    reflector.getAllAndOverride.mockReturnValue(['links:read', 'links:write']);

    const result = guard.canActivate(
      createContext({
        roles: [
          {
            permissions: [
              { name: 'links:read' },
              { name: 'links:write' },
            ],
          },
        ],
      }),
    );

    expect(result).toBe(true);
  });

  it('returns false when user is missing one required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(['links:read', 'links:write']);

    const result = guard.canActivate(
      createContext({
        roles: [
          {
            permissions: [{ name: 'links:read' }],
          },
        ],
      }),
    );

    expect(result).toBe(false);
  });

  it('flattens permissions from multiple roles with Set uniqueness', () => {
    reflector.getAllAndOverride.mockReturnValue(['links:read', 'users:read']);

    const result = guard.canActivate(
      createContext({
        roles: [
          {
            permissions: [
              { name: 'links:read' },
              { name: 'links:read' },
            ],
          },
          {
            permissions: [{ name: 'users:read' }],
          },
        ],
      }),
    );

    expect(result).toBe(true);
  });
});
