import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto, toUserResponse } from './dto/user-response.dto';
import { paginate, PaginatedResultDto } from '../../common/dto/paginated-result.dto';

// Matches the cost the seed script uses, so the two never drift apart.
const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ){}

    // Paginated list with free text search, status / verification / role filters
    // and sorting.
    async findAll(query: QueryUserDto): Promise<PaginatedResultDto<UserResponseDto>> {
        const { page, limit, search, isActive, isEmailVerified, roleId, sortBy, sortOrder } = query;

        // The role rows themselves are joined in, not just their ids: an account
        // holds a handful of roles and the list shows them as badges.
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role');

        if (search) {
            // The concatenation is what makes "ada lovelace" match, which neither
            // name column does on its own.
            queryBuilder.andWhere(
                `(user.firstName ILIKE :search
                    OR user.lastName ILIKE :search
                    OR user.email ILIKE :search
                    OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :search)`,
                { search: `%${search}%` },
            );
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive });
        }

        if (isEmailVerified !== undefined) {
            queryBuilder.andWhere(
                isEmailVerified
                    ? 'user.emailVerifiedAt IS NOT NULL'
                    : 'user.emailVerifiedAt IS NULL',
            );
        }

        if (roleId) {
            // Correlated subquery rather than a condition on the joined alias, so
            // a matching account still lists *every* role it holds.
            const usersWithRole = this.userRepository
                .createQueryBuilder('filtered_user')
                .select('1')
                .innerJoin('filtered_user.roles', 'filtered_role')
                .where('filtered_user.id = user.id')
                .andWhere('filtered_role.id = :roleId')
                .getQuery();

            queryBuilder.andWhere(`EXISTS (${usersWithRole})`, { roleId });
        }

        // Accounts that never logged in carry no timestamp, and they belong at
        // the end of the list rather than on top of a "most recent first" sort.
        queryBuilder.orderBy(
            `user.${sortBy}`,
            sortOrder,
            sortBy === 'lastLoginAt' ? 'NULLS LAST' : undefined,
        );

        if (sortBy !== 'email') {
            // Keeps pages stable when the sorted column holds duplicate values.
            queryBuilder.addOrderBy('user.email', 'ASC');
        }

        // skip / take rather than offset / limit: the join multiplies rows, and
        // only these two paginate over distinct accounts.
        const [users, total] = await queryBuilder
            .skip(query.skip)
            .take(limit)
            .getManyAndCount();

        return paginate(
            users.map(user => toUserResponse(this.withSortedRoles(user))),
            total,
            page,
            limit,
        );
    }

    async findOne(id: string): Promise<UserResponseDto> {
        return toUserResponse(await this.findEntityOrFail(id));
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        await this.assertEmailIsAvailable(createUserDto.email);

        const user = this.userRepository.create({
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            password: await bcrypt.hash(createUserDto.password, PASSWORD_SALT_ROUNDS),
            isActive: createUserDto.isActive ?? true,
            emailVerifiedAt: createUserDto.isEmailVerified ? new Date() : null,
            roles: await this.resolveRoles(createUserDto.roleIds) ?? [],
        });

        return toUserResponse(this.withSortedRoles(await this.userRepository.save(user)));
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.findEntityOrFail(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            await this.assertEmailIsAvailable(updateUserDto.email, id);

            user.email = updateUserDto.email;
        }

        // Only touch these fields when the client actually sent them.
        if (updateUserDto.firstName !== undefined) {
            user.firstName = updateUserDto.firstName;
        }

        if (updateUserDto.lastName !== undefined) {
            user.lastName = updateUserDto.lastName;
        }

        // An omitted password keeps the stored hash: the dashboard leaves the
        // field blank unless somebody is actually changing it.
        if (updateUserDto.password !== undefined) {
            user.password = await bcrypt.hash(updateUserDto.password, PASSWORD_SALT_ROUNDS);
        }

        if (updateUserDto.isActive !== undefined) {
            user.isActive = updateUserDto.isActive;
        }

        if (updateUserDto.isEmailVerified !== undefined) {
            // Re-verifying an already verified address keeps its original
            // timestamp: the column records when the address was verified, not
            // when the form was last saved.
            user.emailVerifiedAt = updateUserDto.isEmailVerified
                ? user.emailVerifiedAt ?? new Date()
                : null;
        }

        const roles = await this.resolveRoles(updateUserDto.roleIds);

        // An omitted list keeps the stored roles, an empty one revokes them all.
        if (roles !== undefined) {
            user.roles = roles;
        }

        return toUserResponse(this.withSortedRoles(await this.userRepository.save(user)));
    }

    async remove(id: string, currentUserId: string): Promise<void> {
        const user = await this.findEntityOrFail(id);

        // A soft deleted account fails the JWT strategy lookup on the very next
        // request, so deleting yourself would end the session doing it.
        if (user.id === currentUserId) {
            throw new ConflictException(
                'You cannot delete your own account. Ask another administrator to do it.',
            );
        }

        // The entity declares a deleted_at column, so deletions are reversible.
        // user_roles is left untouched, and the assignments survive a restore.
        await this.userRepository.softRemove(user);
    }

    // Find User By ID
    async findById(id: string): Promise<User | null>{
        return await this.userRepository.findOne({
            where: { id },
            relations: {
                roles: {
                    permissions: true
                }
            }
        })
    }

    // Find User By Email
    async findByEmail(email: string): Promise<User | null>{
        return await this.userRepository.findOne({
            where: { email },
            relations: {
                roles: true
            }
        });
    }

    // Find By Email Include Password Field
    async findByEmailWithPassword(email: string): Promise<User | null>{
        return await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.roles', 'role')
            .where('user.email = :email', {email})
            .getOne()
    }

    // Update Login Date
    async updateLastLogin(id: string): Promise<void>{
        await this.userRepository.update(id, {
            lastLoginAt: new Date()
        })
    }

    private async findEntityOrFail(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                roles: true
            },
        });

        if (!user) throw new NotFoundException(`User with id "${id}" was not found`);

        return this.withSortedRoles(user);
    }

    /**
     * Relation rows come back in insertion order, which reads as random in the
     * dashboard, so every response sorts them by name once.
     */
    private withSortedRoles(user: User): User {
        user.roles?.sort((a, b) => a.name.localeCompare(b.name));

        return user;
    }

    private async assertEmailIsAvailable(email: string, excludeId?: string): Promise<void> {
        const existing = await this.userRepository.findOne({
            where: excludeId ? { email, id: Not(excludeId) } : { email },
            select: {
                id: true,
                deletedAt: true
            },
            // The unique index spans soft deleted rows, so an address freed by a
            // soft delete is still taken as far as the database is concerned.
            withDeleted: true,
        });

        if (!existing) return;

        // Without this distinction a deleted account reads as "already exists"
        // while being nowhere in the list.
        throw new ConflictException(
            existing.deletedAt
                ? `Email "${email}" belongs to a deleted account and is still reserved. Use a different address.`
                : `Email "${email}" is already in use`,
        );
    }

    /**
     * Turns the submitted ids into role entities.
     *
     * Returns `undefined` when the client omitted the field, which callers read
     * as "keep whatever is stored".
     */
    private async resolveRoles(roleIds?: string[]): Promise<Role[] | undefined> {
        if (roleIds === undefined) return undefined;
        if (roleIds.length === 0) return [];

        const roles = await this.roleRepository.findBy({ id: In(roleIds) });

        if (roles.length !== roleIds.length) {
            const found = new Set(roles.map(role => role.id));
            const missing = roleIds.filter(roleId => !found.has(roleId));

            throw new BadRequestException(
                `These role ids do not exist: ${missing.join(', ')}`,
            );
        }

        return roles;
    }
}
