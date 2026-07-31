import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let controller: UserController;

    const mockUserService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: mockUserService }],
        }).compile();

        controller = module.get(UserController);
    });

    it('findAll delegates to userService.findAll', async () => {
        const query = Object.assign(new QueryUserDto(), { page: 1, limit: 10 });
        const page = { data: [], meta: {} };
        mockUserService.findAll.mockResolvedValue(page);

        await expect(controller.findAll(query)).resolves.toBe(page);
        expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });

    it('findOne delegates to userService.findOne', async () => {
        const user = { id: 'u1' };
        mockUserService.findOne.mockResolvedValue(user);

        await expect(controller.findOne('u1')).resolves.toBe(user);
        expect(mockUserService.findOne).toHaveBeenCalledWith('u1');
    });

    it('create delegates to userService.create', async () => {
        const dto = {
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            password: 'S3cureP@ssw0rd',
        } as CreateUserDto;
        const created = { id: 'u1', ...dto };
        mockUserService.create.mockResolvedValue(created);

        await expect(controller.create(dto)).resolves.toBe(created);
        expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });

    it('update delegates to userService.update', async () => {
        const dto: UpdateUserDto = { firstName: 'Augusta' };
        const updated = { id: 'u1', firstName: 'Augusta' };
        mockUserService.update.mockResolvedValue(updated);

        await expect(controller.update('u1', dto)).resolves.toBe(updated);
        expect(mockUserService.update).toHaveBeenCalledWith('u1', dto);
    });

    it('remove delegates to userService.remove with currentUser.id', async () => {
        const currentUser = { id: 'admin-1' } as User;
        mockUserService.remove.mockResolvedValue(undefined);

        await expect(controller.remove('u1', currentUser)).resolves.toBeUndefined();
        expect(mockUserService.remove).toHaveBeenCalledWith('u1', 'admin-1');
    });
});
