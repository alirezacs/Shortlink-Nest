import { RoleWithCounts, toRoleResponse } from './role-response.dto';

describe('toRoleResponse', () => {
  const now = new Date('2024-01-01T00:00:00.000Z');

  it('maps list rows using relation id counts', () => {
    const role = {
      id: 'r1',
      name: 'admin',
      description: 'Administrator',
      isActive: true,
      permissionIds: ['p1', 'p2'],
      userIds: ['u1'],
      createdAt: now,
      updatedAt: now,
    } as RoleWithCounts;

    expect(toRoleResponse(role)).toEqual({
      id: 'r1',
      name: 'admin',
      description: 'Administrator',
      isActive: true,
      permissionsCount: 2,
      usersCount: 1,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('includes permissions and users on detail rows', () => {
    const role = {
      id: 'r1',
      name: 'admin',
      description: null,
      isActive: true,
      permissions: [{ id: 'p1', name: 'users.read' }],
      users: [
        {
          id: 'u1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
        },
      ],
      createdAt: now,
      updatedAt: now,
    } as RoleWithCounts;

    expect(toRoleResponse(role)).toMatchObject({
      description: null,
      permissionsCount: 1,
      usersCount: 1,
      permissions: [{ id: 'p1', name: 'users.read' }],
      users: [
        {
          id: 'u1',
          fullName: 'Ada Lovelace',
          email: 'ada@example.com',
        },
      ],
    });
  });
});
