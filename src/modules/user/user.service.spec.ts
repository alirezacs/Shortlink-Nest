import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../role/entities/role.entity';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed'),
    compare: jest.fn(),
}));

describe('UserService', () => {
    let service: UserService;

    const userRepository = {
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        softRemove: jest.fn(),
        update: jest.fn(),
    };

    const roleRepository = {
        findBy: jest.fn(),
    };

    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const fixtureUser: User = {
        id: 'u1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'hash',
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        roles: [{ id: 'r1', name: 'admin', isActive: true } as Role],
        createdAt,
        updatedAt,
    } as User;

    function createQueryBuilderMock() {
        return {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
            select: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnValue('SUBQUERY'),
            addSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        };
    }

    beforeEach(async () => {
        jest.clearAllMocks();
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useValue: userRepository },
                { provide: getRepositoryToken(Role), useValue: roleRepository },
            ],
        }).compile();

        service = module.get(UserService);
    });

    describe('findAll', () => {
        it('returns paginated mapped users', async () => {
            const qb = createQueryBuilderMock();
            qb.getManyAndCount.mockResolvedValue([[fixtureUser], 1]);
            userRepository.createQueryBuilder.mockReturnValue(qb);

            const query = Object.assign(new QueryUserDto(), {
                page: 1,
                limit: 10,
                sortBy: 'firstName',
                sortOrder: 'ASC',
            });

            const result = await service.findAll(query);

            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
            expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'role');
            expect(qb.skip).toHaveBeenCalledWith(0);
            expect(qb.take).toHaveBeenCalledWith(10);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toMatchObject({
                id: 'u1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                fullName: 'Ada Lovelace',
                email: 'ada@example.com',
                isActive: true,
                isEmailVerified: false,
                rolesCount: 1,
            });
            expect(result.data[0]).not.toHaveProperty('password');
            expect(result.meta).toMatchObject({
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        it('applies search, status, verification and role filters', async () => {
            const listQb = createQueryBuilderMock();
            const filterQb = createQueryBuilderMock();
            listQb.getManyAndCount.mockResolvedValue([[fixtureUser], 1]);

            userRepository.createQueryBuilder
                .mockReturnValueOnce(listQb)
                .mockReturnValueOnce(filterQb);

            const query = Object.assign(new QueryUserDto(), {
                page: 1,
                limit: 10,
                search: 'ada',
                isActive: true,
                isEmailVerified: true,
                roleId: 'r1',
                sortBy: 'lastLoginAt',
                sortOrder: 'DESC',
            });

            await service.findAll(query);

            expect(listQb.andWhere).toHaveBeenCalledWith(
                expect.stringContaining('user.firstName ILIKE :search'),
                { search: '%ada%' },
            );
            expect(listQb.andWhere).toHaveBeenCalledWith('user.isActive = :isActive', {
                isActive: true,
            });
            expect(listQb.andWhere).toHaveBeenCalledWith(
                'user.emailVerifiedAt IS NOT NULL',
            );
            expect(listQb.andWhere).toHaveBeenCalledWith(
                expect.stringContaining('EXISTS'),
                { roleId: 'r1' },
            );
            expect(listQb.orderBy).toHaveBeenCalledWith(
                'user.lastLoginAt',
                'DESC',
                'NULLS LAST',
            );
            expect(listQb.addOrderBy).toHaveBeenCalledWith('user.email', 'ASC');
        });

        it('filters unverified emails and skips secondary sort when sorting by email', async () => {
            const qb = createQueryBuilderMock();
            qb.getManyAndCount.mockResolvedValue([[], 0]);
            userRepository.createQueryBuilder.mockReturnValue(qb);

            const query = Object.assign(new QueryUserDto(), {
                page: 1,
                limit: 10,
                isEmailVerified: false,
                sortBy: 'email',
                sortOrder: 'ASC',
            });

            await service.findAll(query);

            expect(qb.andWhere).toHaveBeenCalledWith('user.emailVerifiedAt IS NULL');
            expect(qb.orderBy).toHaveBeenCalledWith('user.email', 'ASC', undefined);
            expect(qb.addOrderBy).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('returns mapped user on success', async () => {
            userRepository.findOne.mockResolvedValue({ ...fixtureUser });

            const result = await service.findOne('u1');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'u1' },
                relations: { roles: true },
            });
            expect(result.id).toBe('u1');
            expect(result.fullName).toBe('Ada Lovelace');
            expect(result).not.toHaveProperty('password');
        });

        it('throws NotFoundException when missing', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
            await expect(service.findOne('missing')).rejects.toThrow(
                'User with id "missing" was not found',
            );
        });
    });

    describe('create', () => {
        const createDto = {
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            password: 'S3cureP@ssw0rd',
            roleIds: ['r1'],
        };

        it('hashes password, saves and returns mapped user', async () => {
            userRepository.findOne.mockResolvedValue(null);
            roleRepository.findBy.mockResolvedValue([
                { id: 'r1', name: 'admin', isActive: true },
            ]);
            userRepository.create.mockImplementation((data) => data);
            userRepository.save.mockImplementation(async (user) => ({
                ...fixtureUser,
                ...user,
                id: 'u1',
                createdAt,
                updatedAt,
            }));

            const result = await service.create(createDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('S3cureP@ssw0rd', 10);
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'Ada',
                    lastName: 'Lovelace',
                    email: 'ada@example.com',
                    password: 'hashed',
                    isActive: true,
                    emailVerifiedAt: null,
                }),
            );
            expect(userRepository.save).toHaveBeenCalled();
            expect(result.email).toBe('ada@example.com');
            expect(result).not.toHaveProperty('password');
        });

        it('stamps emailVerifiedAt and respects isActive false when provided', async () => {
            userRepository.findOne.mockResolvedValue(null);
            userRepository.create.mockImplementation((data) => data);
            userRepository.save.mockImplementation(async (user) => ({
                ...fixtureUser,
                ...user,
                id: 'u1',
                createdAt,
                updatedAt,
            }));

            await service.create({
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
                password: 'S3cureP@ssw0rd',
                isActive: false,
                isEmailVerified: true,
            });

            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    isActive: false,
                    emailVerifiedAt: expect.any(Date),
                    roles: [],
                }),
            );
        });

        it('throws ConflictException when email is already in use', async () => {
            userRepository.findOne.mockResolvedValue({
                id: 'other',
                deletedAt: null,
            });

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
            await expect(service.create(createDto)).rejects.toThrow(
                'Email "ada@example.com" is already in use',
            );
        });

        it('throws ConflictException with soft-deleted message', async () => {
            userRepository.findOne.mockResolvedValue({
                id: 'other',
                deletedAt: new Date(),
            });

            await expect(service.create(createDto)).rejects.toThrow(
                'Email "ada@example.com" belongs to a deleted account and is still reserved. Use a different address.',
            );
        });

        it('throws BadRequestException for missing roles', async () => {
            userRepository.findOne.mockResolvedValue(null);
            roleRepository.findBy.mockResolvedValue([]);

            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(createDto)).rejects.toThrow(
                'These role ids do not exist: r1',
            );
        });
    });

    describe('update', () => {
        beforeEach(() => {
            userRepository.findOne.mockResolvedValue({
                ...fixtureUser,
                roles: [...fixtureUser.roles],
            });
            userRepository.save.mockImplementation(async (user) => user);
        });

        it('updates partial fields', async () => {
            const result = await service.update('u1', { firstName: 'Augusta' });

            expect(result.firstName).toBe('Augusta');
            expect(result.lastName).toBe('Lovelace');
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('updates lastName, email, isActive and verifies email', async () => {
            userRepository.findOne
                .mockResolvedValueOnce({
                    ...fixtureUser,
                    roles: [...fixtureUser.roles],
                })
                .mockResolvedValueOnce(null);
            userRepository.save.mockImplementation(async (user) => user);

            const result = await service.update('u1', {
                lastName: 'Byron',
                email: 'new@example.com',
                isActive: false,
                isEmailVerified: true,
            });

            expect(result.lastName).toBe('Byron');
            expect(result.email).toBe('new@example.com');
            expect(result.isActive).toBe(false);
            expect(result.isEmailVerified).toBe(true);
            expect(result.emailVerifiedAt).toEqual(expect.any(Date));
        });

        it('keeps original emailVerifiedAt when re-verifying an already verified user', async () => {
            const verifiedAt = new Date('2023-05-01T00:00:00.000Z');
            userRepository.findOne.mockResolvedValue({
                ...fixtureUser,
                emailVerifiedAt: verifiedAt,
                roles: [...fixtureUser.roles],
            });

            const result = await service.update('u1', { isEmailVerified: true });

            expect(result.emailVerifiedAt).toBe(verifiedAt);
        });

        it('clears emailVerifiedAt when isEmailVerified is false', async () => {
            userRepository.findOne.mockResolvedValue({
                ...fixtureUser,
                emailVerifiedAt: new Date(),
                roles: [...fixtureUser.roles],
            });

            const result = await service.update('u1', { isEmailVerified: false });

            expect(result.emailVerifiedAt).toBeNull();
            expect(result.isEmailVerified).toBe(false);
        });

        it('rehashes password when provided', async () => {
            await service.update('u1', { password: 'NewP@ssw0rd' });

            expect(bcrypt.hash).toHaveBeenCalledWith('NewP@ssw0rd', 10);
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'hashed' }),
            );
        });

        it('clears roles when roleIds is []', async () => {
            const result = await service.update('u1', { roleIds: [] });

            expect(result.roles).toEqual([]);
            expect(result.rolesCount).toBe(0);
        });

        it('keeps roles when roleIds is omitted', async () => {
            const result = await service.update('u1', { firstName: 'Ada' });

            expect(result.roles).toEqual([
                { id: 'r1', name: 'admin', isActive: true },
            ]);
            expect(roleRepository.findBy).not.toHaveBeenCalled();
        });

        it('throws ConflictException on email conflict', async () => {
            userRepository.findOne
                .mockResolvedValueOnce({
                    ...fixtureUser,
                    roles: [...fixtureUser.roles],
                })
                .mockResolvedValueOnce({ id: 'other', deletedAt: null });

            await expect(
                service.update('u1', { email: 'taken@example.com' }),
            ).rejects.toThrow(ConflictException);
        });

        it('throws NotFoundException when user is missing', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.update('missing', { firstName: 'X' })).rejects.toThrow(
                NotFoundException,
            );
        });

        it('sorts roles by name in the response', async () => {
            userRepository.findOne.mockResolvedValue({
                ...fixtureUser,
                roles: [
                    { id: 'r2', name: 'viewer', isActive: true } as Role,
                    { id: 'r1', name: 'admin', isActive: true } as Role,
                ],
            });

            const result = await service.findOne('u1');

            expect(result.roles.map((role) => role.name)).toEqual(['admin', 'viewer']);
        });
    });

    describe('remove', () => {
        it('soft-removes the user', async () => {
            userRepository.findOne.mockResolvedValue({ ...fixtureUser });
            userRepository.softRemove.mockResolvedValue(undefined);

            await service.remove('u1', 'admin-id');

            expect(userRepository.softRemove).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'u1' }),
            );
        });

        it('throws ConflictException when deleting self', async () => {
            userRepository.findOne.mockResolvedValue({ ...fixtureUser });

            await expect(service.remove('u1', 'u1')).rejects.toThrow(ConflictException);
            await expect(service.remove('u1', 'u1')).rejects.toThrow(
                'You cannot delete your own account. Ask another administrator to do it.',
            );
            expect(userRepository.softRemove).not.toHaveBeenCalled();
        });

        it('throws NotFoundException when user is missing', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('missing', 'admin-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findById', () => {
        it('loads user with roles and permissions', async () => {
            userRepository.findOne.mockResolvedValue(fixtureUser);

            const result = await service.findById('u1');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'u1' },
                relations: {
                    roles: {
                        permissions: true,
                    },
                },
            });
            expect(result).toBe(fixtureUser);
        });
    });

    describe('findByEmail', () => {
        it('loads user with roles', async () => {
            userRepository.findOne.mockResolvedValue(fixtureUser);

            const result = await service.findByEmail('ada@example.com');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'ada@example.com' },
                relations: { roles: true },
            });
            expect(result).toBe(fixtureUser);
        });
    });

    describe('findByEmailWithPassword', () => {
        it('selects password via query builder', async () => {
            const qb = createQueryBuilderMock();
            qb.getOne.mockResolvedValue(fixtureUser);
            userRepository.createQueryBuilder.mockReturnValue(qb);

            const result = await service.findByEmailWithPassword('ada@example.com');

            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
            expect(qb.addSelect).toHaveBeenCalledWith('user.password');
            expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'role');
            expect(qb.where).toHaveBeenCalledWith('user.email = :email', {
                email: 'ada@example.com',
            });
            expect(result).toBe(fixtureUser);
        });
    });

    describe('updateLastLogin', () => {
        it('updates lastLoginAt', async () => {
            userRepository.update.mockResolvedValue(undefined);

            await service.updateLastLogin('u1');

            expect(userRepository.update).toHaveBeenCalledWith(
                'u1',
                expect.objectContaining({
                    lastLoginAt: expect.any(Date),
                }),
            );
        });
    });
});
