import { Role } from '../../role/entities/role.entity';
import { User } from '../entities/user.entity';
import { toUserResponse } from './user-response.dto';

describe('toUserResponse', () => {
  const now = new Date('2024-01-01T00:00:00.000Z');

  it('maps user fields and never exposes password', () => {
    const user = {
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret-hash',
      isActive: true,
      emailVerifiedAt: now,
      lastLoginAt: null,
      roles: [{ id: 'r1', name: 'admin', isActive: true } as Role],
      createdAt: now,
      updatedAt: now,
    } as User;

    const result = toUserResponse(user);

    expect(result).toEqual({
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: now,
      lastLoginAt: null,
      rolesCount: 1,
      roles: [{ id: 'r1', name: 'admin', isActive: true }],
      createdAt: now,
      updatedAt: now,
    });
    expect(result).not.toHaveProperty('password');
  });

  it('treats missing roles as an empty list', () => {
    const user = {
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      isActive: true,
      emailVerifiedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    } as User;

    const result = toUserResponse(user);

    expect(result.roles).toEqual([]);
    expect(result.rolesCount).toBe(0);
    expect(result.isEmailVerified).toBe(false);
  });
});
