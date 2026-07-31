import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: jest.Mocked<
    Pick<RoleService, 'findAll' | 'findOne' | 'create' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    roleService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useValue: roleService }],
    }).compile();

    controller = module.get(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to RoleService', async () => {
    const query = { page: 1, limit: 10 } as QueryRoleDto;
    const expected = { data: [], meta: {} };
    roleService.findAll.mockResolvedValue(expected as never);

    await expect(controller.findAll(query)).resolves.toBe(expected);
    expect(roleService.findAll).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to RoleService', async () => {
    const expected = { id: 'role-1', name: 'editor' };
    roleService.findOne.mockResolvedValue(expected as never);

    await expect(controller.findOne('role-1')).resolves.toBe(expected);
    expect(roleService.findOne).toHaveBeenCalledWith('role-1');
  });

  it('create delegates to RoleService', async () => {
    const dto = { name: 'editor' } as CreateRoleDto;
    const expected = { id: 'role-1', name: 'editor' };
    roleService.create.mockResolvedValue(expected as never);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(roleService.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to RoleService', async () => {
    const dto = { description: 'Updated' } as UpdateRoleDto;
    const expected = { id: 'role-1', description: 'Updated' };
    roleService.update.mockResolvedValue(expected as never);

    await expect(controller.update('role-1', dto)).resolves.toBe(expected);
    expect(roleService.update).toHaveBeenCalledWith('role-1', dto);
  });

  it('remove delegates to RoleService', async () => {
    roleService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('role-1')).resolves.toBeUndefined();
    expect(roleService.remove).toHaveBeenCalledWith('role-1');
  });
});
