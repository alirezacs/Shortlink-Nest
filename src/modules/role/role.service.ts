import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import {
    RoleResponseDto,
    RoleWithCounts,
    toRoleResponse,
} from './dto/role-response.dto';
import { paginate, PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>
    ){}

    // Paginated list with free text search, status / assignment filters and sorting.
    async findAll(query: QueryRoleDto): Promise<PaginatedResultDto<RoleResponseDto>> {
        const { page, limit, search, isActive, assigned, sortBy, sortOrder } = query;

        const queryBuilder = this.roleRepository
            .createQueryBuilder('role')
            // Ids only: the list needs how many permissions and users a role has,
            // not the rows themselves.
            .loadRelationIdAndMap('role.permissionIds', 'role.permissions')
            .loadRelationIdAndMap('role.userIds', 'role.users');

        if (search) {
            queryBuilder.andWhere(
                '(role.name ILIKE :search OR role.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('role.isActive = :isActive', { isActive });
        }

        if (assigned !== undefined) {
            // Correlated subquery, so the filter keeps working alongside pagination.
            const assignedRoles = this.roleRepository
                .createQueryBuilder('assigned_role')
                .select('1')
                .innerJoin('assigned_role.users', 'assigned_user')
                .where('assigned_role.id = role.id')
                .getQuery();

            queryBuilder.andWhere(
                assigned ? `EXISTS (${assignedRoles})` : `NOT EXISTS (${assignedRoles})`,
            );
        }

        queryBuilder.orderBy(`role.${sortBy}`, sortOrder);

        if (sortBy !== 'name') {
            // Keeps pages stable when the sorted column holds duplicate values.
            queryBuilder.addOrderBy('role.name', 'ASC');
        }

        const [roles, total] = await queryBuilder
            .skip(query.skip)
            .take(limit)
            .getManyAndCount();

        return paginate(
            (roles as RoleWithCounts[]).map(toRoleResponse),
            total,
            page,
            limit,
        );
    }

    async findOne(id: string): Promise<RoleResponseDto> {
        return toRoleResponse(await this.findEntityOrFail(id));
    }

    async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
        await this.assertNameIsAvailable(createRoleDto.name);

        const role = this.roleRepository.create({
            name: createRoleDto.name,
            description: createRoleDto.description ?? null,
            isActive: createRoleDto.isActive ?? true,
            permissions: await this.resolvePermissions(createRoleDto.permissionIds) ?? [],
        });

        return toRoleResponse(await this.roleRepository.save(role));
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
        const role = await this.findEntityOrFail(id);

        if (updateRoleDto.name && updateRoleDto.name !== role.name) {
            await this.assertNameIsAvailable(updateRoleDto.name, id);

            role.name = updateRoleDto.name;
        }

        // Only touch these fields when the client actually sent them.
        if (updateRoleDto.description !== undefined) {
            role.description = updateRoleDto.description;
        }

        if (updateRoleDto.isActive !== undefined) {
            role.isActive = updateRoleDto.isActive;
        }

        const permissions = await this.resolvePermissions(updateRoleDto.permissionIds);

        // An omitted list keeps the stored permissions, an empty one revokes them all.
        if (permissions !== undefined) {
            role.permissions = permissions;
        }

        return toRoleResponse(await this.roleRepository.save(role));
    }

    async remove(id: string): Promise<void> {
        const role = await this.findEntityOrFail(id);

        // user_roles does not cascade on delete, so refuse with a helpful message
        // instead of surfacing a foreign key error.
        if (role.users.length > 0) {
            const userEmails = role.users.map(user => user.email).join(', ');

            throw new ConflictException(
                `Role "${role.name}" is still assigned to these users: ${userEmails}. Detach it from every user before deleting it.`,
            );
        }

        // The entity declares a deleted_at column, so deletions are reversible and
        // the role keeps its permission assignments.
        await this.roleRepository.softRemove(role);
    }

    private async findEntityOrFail(id: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: {
                permissions: true,
                users: true
            },
        });

        if (!role) throw new NotFoundException(`Role with id "${id}" was not found`);

        // Relation rows come back in insertion order, which reads as random in the
        // dashboard, so the permission list is sorted here once for every caller.
        role.permissions.sort((a, b) => a.name.localeCompare(b.name));

        return role;
    }

    private async assertNameIsAvailable(name: string, excludeId?: string): Promise<void> {
        const existing = await this.roleRepository.findOne({
            where: excludeId ? { name, id: Not(excludeId) } : { name },
            select: {
                id: true,
                deletedAt: true
            },
            // The unique index spans soft deleted rows, so a name freed by a soft
            // delete is still taken as far as the database is concerned.
            withDeleted: true,
        });

        if (!existing) return;

        // Without this distinction a deleted role reads as "already exists" while
        // being nowhere in the list.
        throw new ConflictException(
            existing.deletedAt
                ? `Role "${name}" belongs to a deleted role and its name is still reserved. Choose a different name.`
                : `Role "${name}" already exists`,
        );
    }

    /**
     * Turns the submitted ids into permission entities.
     *
     * Returns `undefined` when the client omitted the field, which callers read as
     * "keep whatever is stored".
     */
    private async resolvePermissions(
        permissionIds?: string[],
    ): Promise<Permission[] | undefined> {
        if (permissionIds === undefined) return undefined;
        if (permissionIds.length === 0) return [];

        const permissions = await this.permissionRepository.findBy({
            id: In(permissionIds),
        });

        if (permissions.length !== permissionIds.length) {
            const found = new Set(permissions.map(permission => permission.id));
            const missing = permissionIds.filter(permissionId => !found.has(permissionId));

            throw new BadRequestException(
                `These permission ids do not exist: ${missing.join(', ')}`,
            );
        }

        return permissions;
    }
}
