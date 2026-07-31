import { Permission } from '../entities/permission.entity';
import {
  permissionGroup,
  toPermissionResponse,
  PermissionWithRolesCount,
} from './permission-response.dto';

describe('permissionGroup', () => {
  it('returns the first name segment', () => {
    expect(permissionGroup('users.read')).toBe('users');
    expect(permissionGroup('settings')).toBe('settings');
  });
});

describe('toPermissionResponse', () => {
  const now = new Date('2024-01-01T00:00:00.000Z');

  it('maps list rows using roleIds for rolesCount', () => {
    const permission = {
      id: 'p1',
      name: 'users.read',
      description: 'Read users',
      roleIds: ['r1', 'r2'],
      createdAt: now,
      updatedAt: now,
    } as PermissionWithRolesCount;

    expect(toPermissionResponse(permission)).toEqual({
      id: 'p1',
      name: 'users.read',
      description: 'Read users',
      group: 'users',
      rolesCount: 2,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('includes role details when roles relation is loaded', () => {
    const permission = {
      id: 'p1',
      name: 'users.read',
      description: null,
      roles: [{ id: 'r1', name: 'admin' }],
      createdAt: now,
      updatedAt: now,
    } as PermissionWithRolesCount;

    expect(toPermissionResponse(permission)).toMatchObject({
      description: null,
      rolesCount: 1,
      roles: [{ id: 'r1', name: 'admin' }],
    });
  });
});
