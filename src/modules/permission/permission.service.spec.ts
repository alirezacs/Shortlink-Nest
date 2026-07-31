import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { Role } from '../role/entities/role.entity';

function createChainableQueryBuilder(overrides: Record<string, unknown> = {}) {
  const qb: Record<string, jest.Mock> = {
    loadRelationIdAndMap: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('SELECT 1 FROM assigned'),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getRawMany: jest.fn().mockResolvedValue([]),
    ...overrides,
  };

  Object.keys(qb).forEach((key) => {
    if (
      !['getQuery', 'getManyAndCount', 'getRawMany'].includes(key) &&
      typeof qb[key] === 'function'
    ) {
      qb[key].mockReturnThis();
    }
  });

  return qb;
}

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepository: jest.Mocked<
    Pick<
      Repository<Permission>,
      'createQueryBuilder' | 'findOne' | 'create' | 'save' | 'remove'
    >
  >;

  const now = new Date('2026-01-01T00:00:00.000Z');

  const basePermission = (overrides: Partial<Permission> = {}): Permission =>
    ({
      id: 'perm-1',
      name: 'users.read',
      description: 'Read users',
      createdAt: now,
      updatedAt: now,
      roles: [],
      ...overrides,
    }) as Permission;

  beforeEach(async () => {
    permissionRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
      ],
    }).compile();

    service = module.get(PermissionService);
  });

  describe('findAll', () => {
    it('returns a paginated list of permissions', async () => {
      const permissions = [
        {
          ...basePermission(),
          roleIds: ['r1', 'r2'],
        },
      ];
      const qb = createChainableQueryBuilder({
        getManyAndCount: jest.fn().mockResolvedValue([permissions, 1]),
      });
      permissionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'ASC',
        skip: 0,
      } as QueryPermissionDto);

      expect(permissionRepository.createQueryBuilder).toHaveBeenCalledWith(
        'permission',
      );
      expect(result.data[0].group).toBe('users');
      expect(result.data[0].rolesCount).toBe(2);
      expect(result.meta.total).toBe(1);
    });

    it('applies search, group, assigned filters and secondary sort', async () => {
      const qb = createChainableQueryBuilder();
      permissionRepository.createQueryBuilder.mockReturnValue(qb as never);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'users',
        group: 'users',
        assigned: true,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        skip: 0,
      } as QueryPermissionDto);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(permission.name ILIKE :search OR permission.description ILIKE :search)',
        { search: '%users%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(permission.name = :group OR permission.name LIKE :groupPrefix)',
        { group: 'users', groupPrefix: 'users.%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('EXISTS'),
      );
      expect(qb.addOrderBy).toHaveBeenCalledWith('permission.name', 'ASC');
    });

    it('uses NOT EXISTS when assigned is false', async () => {
      const qb = createChainableQueryBuilder();
      permissionRepository.createQueryBuilder.mockReturnValue(qb as never);

      await service.findAll({
        page: 1,
        limit: 10,
        assigned: false,
        sortBy: 'name',
        sortOrder: 'ASC',
        skip: 0,
      } as QueryPermissionDto);

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('NOT EXISTS'),
      );
    });
  });

  describe('findGroups', () => {
    it('returns distinct group names from raw rows', async () => {
      const qb = createChainableQueryBuilder({
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ group: 'roles' }, { group: 'users' }]),
      });
      permissionRepository.createQueryBuilder.mockReturnValue(qb as never);

      await expect(service.findGroups()).resolves.toEqual(['roles', 'users']);
      expect(qb.select).toHaveBeenCalledWith(
        "split_part(permission.name, '.', 1)",
        'group',
      );
      expect(qb.distinct).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('returns a mapped permission with roles', async () => {
      const permission = basePermission({
        roles: [{ id: 'r1', name: 'admin' } as Role],
      });
      permissionRepository.findOne.mockResolvedValue(permission);

      const result = await service.findOne('perm-1');

      expect(result.group).toBe('users');
      expect(result.roles).toEqual([{ id: 'r1', name: 'admin' }]);
      expect(result.rolesCount).toBe(1);
    });

    it('throws NotFound when permission is missing', async () => {
      permissionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a permission when the name is available', async () => {
      permissionRepository.findOne.mockResolvedValue(null);
      const created = basePermission();
      permissionRepository.create.mockReturnValue(created);
      permissionRepository.save.mockResolvedValue(created);

      const result = await service.create({
        name: 'users.read',
        description: 'Read users',
      });

      expect(permissionRepository.create).toHaveBeenCalledWith({
        name: 'users.read',
        description: 'Read users',
      });
      expect(result.name).toBe('users.read');
    });

    it('defaults description to null when omitted', async () => {
      permissionRepository.findOne.mockResolvedValue(null);
      permissionRepository.create.mockImplementation((data) => data as Permission);
      permissionRepository.save.mockImplementation(async (permission) => ({
        ...basePermission(),
        ...permission,
      }));

      await service.create({ name: 'users.write' });

      expect(permissionRepository.create).toHaveBeenCalledWith({
        name: 'users.write',
        description: null,
      });
    });

    it('throws Conflict when the name already exists', async () => {
      permissionRepository.findOne.mockResolvedValue({ id: 'other' } as Permission);

      await expect(
        service.create({ name: 'users.read' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create({ name: 'users.read' }),
      ).rejects.toThrow('Permission "users.read" already exists');
    });
  });

  describe('update', () => {
    it('updates name and description', async () => {
      const permission = basePermission();
      permissionRepository.findOne
        .mockResolvedValueOnce(permission)
        .mockResolvedValueOnce(null);
      permissionRepository.save.mockImplementation(
        async (entity) => entity as Permission,
      );

      const result = await service.update('perm-1', {
        name: 'users.write',
        description: 'Write users',
      });

      expect(result.name).toBe('users.write');
      expect(permission.description).toBe('Write users');
    });

    it('keeps the name and skips uniqueness when name is unchanged', async () => {
      const permission = basePermission({ name: 'users.read' });
      permissionRepository.findOne.mockResolvedValue(permission);
      permissionRepository.save.mockImplementation(
        async (entity) => entity as Permission,
      );

      await service.update('perm-1', { description: 'Updated docs' });

      expect(permission.description).toBe('Updated docs');
      expect(permissionRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('throws NotFound when permission is missing', async () => {
      permissionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', { description: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Conflict when renaming to a taken name', async () => {
      permissionRepository.findOne
        .mockResolvedValueOnce(basePermission())
        .mockResolvedValueOnce({ id: 'other' } as Permission);

      await expect(
        service.update('perm-1', { name: 'users.write' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('hard-removes a permission with no assigned roles', async () => {
      const permission = basePermission({ roles: [] });
      permissionRepository.findOne.mockResolvedValue(permission);
      permissionRepository.remove.mockResolvedValue(permission);

      await service.remove('perm-1');

      expect(permissionRepository.remove).toHaveBeenCalledWith(permission);
    });

    it('throws Conflict when roles are still assigned', async () => {
      const permission = basePermission({
        roles: [
          { id: 'r1', name: 'admin' } as Role,
          { id: 'r2', name: 'editor' } as Role,
        ],
      });
      permissionRepository.findOne.mockResolvedValue(permission);

      await expect(service.remove('perm-1')).rejects.toThrow(ConflictException);
      await expect(service.remove('perm-1')).rejects.toThrow('admin, editor');
      expect(permissionRepository.remove).not.toHaveBeenCalled();
    });

    it('throws NotFound when permission is missing', async () => {
      permissionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
