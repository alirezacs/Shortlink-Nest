import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: jest.Mocked<
    Pick<
      PermissionService,
      'findAll' | 'findGroups' | 'findOne' | 'create' | 'update' | 'remove'
    >
  >;

  beforeEach(async () => {
    permissionService = {
      findAll: jest.fn(),
      findGroups: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        { provide: PermissionService, useValue: permissionService },
      ],
    }).compile();

    controller = module.get(PermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to PermissionService', async () => {
    const query = { page: 1, limit: 10 } as QueryPermissionDto;
    const expected = { data: [], meta: {} };
    permissionService.findAll.mockResolvedValue(expected as never);

    await expect(controller.findAll(query)).resolves.toBe(expected);
    expect(permissionService.findAll).toHaveBeenCalledWith(query);
  });

  it('findGroups delegates to PermissionService', async () => {
    permissionService.findGroups.mockResolvedValue(['users', 'roles']);

    await expect(controller.findGroups()).resolves.toEqual([
      'users',
      'roles',
    ]);
    expect(permissionService.findGroups).toHaveBeenCalled();
  });

  it('findOne delegates to PermissionService', async () => {
    const expected = { id: 'perm-1', name: 'users.read' };
    permissionService.findOne.mockResolvedValue(expected as never);

    await expect(controller.findOne('perm-1')).resolves.toBe(expected);
    expect(permissionService.findOne).toHaveBeenCalledWith('perm-1');
  });

  it('create delegates to PermissionService', async () => {
    const dto = { name: 'users.read' } as CreatePermissionDto;
    const expected = { id: 'perm-1', name: 'users.read' };
    permissionService.create.mockResolvedValue(expected as never);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(permissionService.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to PermissionService', async () => {
    const dto = { description: 'Updated' } as UpdatePermissionDto;
    const expected = { id: 'perm-1', description: 'Updated' };
    permissionService.update.mockResolvedValue(expected as never);

    await expect(controller.update('perm-1', dto)).resolves.toBe(expected);
    expect(permissionService.update).toHaveBeenCalledWith('perm-1', dto);
  });

  it('remove delegates to PermissionService', async () => {
    permissionService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('perm-1')).resolves.toBeUndefined();
    expect(permissionService.remove).toHaveBeenCalledWith('perm-1');
  });
});
