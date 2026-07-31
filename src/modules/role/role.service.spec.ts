import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { RoleService } from './role.service';
import { QueryRoleDto } from './dto/query-role.dto';

function createChainableQueryBuilder(overrides: Record<string, unknown> = {}) {
  const qb: Record<string, jest.Mock> = {
    loadRelationIdAndMap: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('SELECT 1 FROM assigned'),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    ...overrides,
  };

  Object.keys(qb).forEach((key) => {
    if (key !== 'getQuery' && key !== 'getManyAndCount' && typeof qb[key] === 'function') {
      qb[key].mockReturnThis();
    }
  });

  return qb;
}

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<Pick<
    Repository<Role>,
    'createQueryBuilder' | 'findOne' | 'create' | 'save' | 'softRemove'
  >>;
  let permissionRepository: jest.Mocked<Pick<Repository<Permission>, 'findBy'>>;

  const now = new Date('2026-01-01T00:00:00.000Z');

  const baseRole = (overrides: Partial<Role> = {}): Role =>
    ({
      id: 'role-1',
      name: 'editor',
      description: 'Edits content',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      permissions: [],
      users: [],
      ...overrides,
    }) as Role;

  beforeEach(async () => {
    roleRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    permissionRepository = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
      ],
    }).compile();

    service = module.get(RoleService);
  });

  describe('findAll', () => {
    it('returns a paginated list of roles', async () => {
      const roles = [
        {
          ...baseRole(),
          permissionIds: ['p1', 'p2'],
          userIds: ['u1'],
        },
      ];
      const qb = createChainableQueryBuilder({
        getManyAndCount: jest.fn().mockResolvedValue([roles, 1]),
      });
      roleRepository.createQueryBuilder.mockReturnValue(qb as never);

      const query = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'ASC',
        skip: 0,
      } as QueryRoleDto;

      const result = await service.findAll(query);

      expect(roleRepository.createQueryBuilder).toHaveBeenCalledWith('role');
      expect(qb.loadRelationIdAndMap).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('role.name', 'ASC');
      expect(qb.addOrderBy).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].permissionsCount).toBe(2);
      expect(result.data[0].usersCount).toBe(1);
      expect(result.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('applies search, isActive, assigned filters and secondary sort', async () => {
      const qb = createChainableQueryBuilder({
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });
      roleRepository.createQueryBuilder.mockReturnValue(qb as never);

      const query = {
        page: 2,
        limit: 5,
        search: 'admin',
        isActive: true,
        assigned: true,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        skip: 5,
      } as QueryRoleDto;

      await service.findAll(query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: '%admin%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('role.isActive = :isActive', {
        isActive: true,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('EXISTS'),
      );
      expect(qb.orderBy).toHaveBeenCalledWith('role.createdAt', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('role.name', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(5);
      expect(qb.take).toHaveBeenCalledWith(5);
    });

    it('uses NOT EXISTS when assigned is false', async () => {
      const qb = createChainableQueryBuilder();
      roleRepository.createQueryBuilder.mockReturnValue(qb as never);

      await service.findAll({
        page: 1,
        limit: 10,
        assigned: false,
        sortBy: 'name',
        sortOrder: 'ASC',
        skip: 0,
      } as QueryRoleDto);

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('NOT EXISTS'),
      );
    });
  });

  describe('findOne', () => {
    it('returns a mapped role with sorted permissions', async () => {
      const role = baseRole({
        permissions: [
          { id: 'p2', name: 'users.write' } as Permission,
          { id: 'p1', name: 'users.read' } as Permission,
        ],
        users: [
          {
            id: 'u1',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
          } as never,
        ],
      });
      roleRepository.findOne.mockResolvedValue(role);

      const result = await service.findOne('role-1');

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        relations: { permissions: true, users: true },
      });
      expect(result.permissions?.map((p) => p.name)).toEqual([
        'users.read',
        'users.write',
      ]);
      expect(result.users?.[0]).toMatchObject({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
      });
    });

    it('throws NotFound when role is missing', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a role with resolved permissions', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      const permissions = [
        { id: 'p1', name: 'users.read' } as Permission,
      ];
      permissionRepository.findBy.mockResolvedValue(permissions);

      const created = baseRole({ permissions });
      roleRepository.create.mockReturnValue(created);
      roleRepository.save.mockResolvedValue(created);

      const result = await service.create({
        name: 'editor',
        description: 'Edits content',
        permissionIds: ['p1'],
      });

      expect(roleRepository.create).toHaveBeenCalledWith({
        name: 'editor',
        description: 'Edits content',
        isActive: true,
        permissions,
      });
      expect(result.name).toBe('editor');
      expect(result.permissionsCount).toBe(1);
    });

    it('defaults description to null and respects isActive false', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      roleRepository.create.mockImplementation((data) => data as Role);
      roleRepository.save.mockImplementation(async (role) => ({
        ...baseRole(),
        ...role,
      }));

      await service.create({
        name: 'viewer',
        isActive: false,
      });

      expect(roleRepository.create).toHaveBeenCalledWith({
        name: 'viewer',
        description: null,
        isActive: false,
        permissions: [],
      });
    });

    it('throws Conflict when a live role already uses the name', async () => {
      roleRepository.findOne.mockResolvedValue({
        id: 'other',
        deletedAt: undefined,
      } as Role);

      await expect(
        service.create({ name: 'editor' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create({ name: 'editor' }),
      ).rejects.toThrow('Role "editor" already exists');
    });

    it('throws Conflict when a soft-deleted role still reserves the name', async () => {
      roleRepository.findOne.mockResolvedValue({
        id: 'deleted',
        deletedAt: now,
      } as Role);

      await expect(
        service.create({ name: 'editor' }),
      ).rejects.toThrow(
        'Role "editor" belongs to a deleted role and its name is still reserved',
      );
    });

    it('throws BadRequest when permission ids are missing', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      permissionRepository.findBy.mockResolvedValue([
        { id: 'p1', name: 'users.read' } as Permission,
      ]);

      await expect(
        service.create({
          name: 'editor',
          permissionIds: ['p1', 'missing'],
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({
          name: 'editor',
          permissionIds: ['p1', 'missing'],
        }),
      ).rejects.toThrow('These permission ids do not exist: missing');
    });
  });

  describe('update', () => {
    it('updates fields and replaces permissions', async () => {
      const role = baseRole({
        permissions: [{ id: 'p1', name: 'users.read' } as Permission],
      });
      roleRepository.findOne
        .mockResolvedValueOnce(role)
        .mockResolvedValueOnce(null);

      const newPermissions = [
        { id: 'p2', name: 'users.write' } as Permission,
      ];
      permissionRepository.findBy.mockResolvedValue(newPermissions);
      roleRepository.save.mockImplementation(async (entity) => entity as Role);

      const result = await service.update('role-1', {
        name: 'publisher',
        description: 'Publishes',
        isActive: false,
        permissionIds: ['p2'],
      });

      expect(result.name).toBe('publisher');
      expect(role.permissions).toEqual(newPermissions);
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('keeps permissions when permissionIds is omitted', async () => {
      const role = baseRole({
        permissions: [{ id: 'p1', name: 'users.read' } as Permission],
      });
      roleRepository.findOne.mockResolvedValue(role);
      roleRepository.save.mockImplementation(async (entity) => entity as Role);

      await service.update('role-1', { description: 'Updated' });

      expect(permissionRepository.findBy).not.toHaveBeenCalled();
      expect(role.permissions).toHaveLength(1);
    });

    it('clears permissions when an empty array is sent', async () => {
      const role = baseRole({
        permissions: [{ id: 'p1', name: 'users.read' } as Permission],
      });
      roleRepository.findOne.mockResolvedValue(role);
      roleRepository.save.mockImplementation(async (entity) => entity as Role);

      await service.update('role-1', { permissionIds: [] });

      expect(role.permissions).toEqual([]);
    });

    it('throws NotFound when role is missing', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', { description: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Conflict when renaming to a taken name', async () => {
      roleRepository.findOne
        .mockResolvedValueOnce(baseRole())
        .mockResolvedValueOnce({ id: 'other', deletedAt: undefined } as Role);

      await expect(
        service.update('role-1', { name: 'admin' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft-removes a role with no assigned users', async () => {
      const role = baseRole({ users: [] });
      roleRepository.findOne.mockResolvedValue(role);
      roleRepository.softRemove.mockResolvedValue(role);

      await service.remove('role-1');

      expect(roleRepository.softRemove).toHaveBeenCalledWith(role);
    });

    it('throws Conflict when users are still assigned', async () => {
      const role = baseRole({
        users: [
          { id: 'u1', email: 'a@example.com' } as never,
          { id: 'u2', email: 'b@example.com' } as never,
        ],
      });
      roleRepository.findOne.mockResolvedValue(role);

      await expect(service.remove('role-1')).rejects.toThrow(ConflictException);
      await expect(service.remove('role-1')).rejects.toThrow(
        'a@example.com, b@example.com',
      );
      expect(roleRepository.softRemove).not.toHaveBeenCalled();
    });

    it('throws NotFound when role is missing', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
