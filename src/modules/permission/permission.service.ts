import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import {
    PermissionResponseDto,
    PermissionWithRolesCount,
    toPermissionResponse,
} from './dto/permission-response.dto';
import { paginate, PaginatedResultDto } from '../../common/dto/paginated-result.dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>
    ){}

    // Paginated list with free text search, group / assignment filters and sorting.
    async findAll(query: QueryPermissionDto): Promise<PaginatedResultDto<PermissionResponseDto>> {
        const { page, limit, search, group, assigned, sortBy, sortOrder } = query;

        const queryBuilder = this.permissionRepository
            .createQueryBuilder('permission')
            // Ids only: the list needs how many roles use a permission, not the rows.
            .loadRelationIdAndMap('permission.roleIds', 'permission.roles');

        if (search) {
            queryBuilder.andWhere(
                '(permission.name ILIKE :search OR permission.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (group) {
            queryBuilder.andWhere(
                '(permission.name = :group OR permission.name LIKE :groupPrefix)',
                { group, groupPrefix: `${group}.%` },
            );
        }

        if (assigned !== undefined) {
            // Correlated subquery, so the filter keeps working alongside pagination.
            const assignedPermissions = this.permissionRepository
                .createQueryBuilder('assigned_permission')
                .select('1')
                .innerJoin('assigned_permission.roles', 'assigned_role')
                .where('assigned_permission.id = permission.id')
                .getQuery();

            queryBuilder.andWhere(
                assigned
                    ? `EXISTS (${assignedPermissions})`
                    : `NOT EXISTS (${assignedPermissions})`,
            );
        }

        queryBuilder.orderBy(`permission.${sortBy}`, sortOrder);

        if (sortBy !== 'name') {
            // Keeps pages stable when the sorted column holds duplicate values.
            queryBuilder.addOrderBy('permission.name', 'ASC');
        }

        const [permissions, total] = await queryBuilder
            .skip(query.skip)
            .take(limit)
            .getManyAndCount();

        return paginate(
            (permissions as PermissionWithRolesCount[]).map(toPermissionResponse),
            total,
            page,
            limit,
        );
    }

    // Distinct first name segments, used by the group filter in the dashboard.
    async findGroups(): Promise<string[]> {
        const groupExpression = "split_part(permission.name, '.', 1)";

        const rows = await this.permissionRepository
            .createQueryBuilder('permission')
            .select(groupExpression, 'group')
            .distinct(true)
            .orderBy(groupExpression, 'ASC')
            .getRawMany<{ group: string }>();

        return rows.map(row => row.group);
    }

    async findOne(id: string): Promise<PermissionResponseDto> {
        return toPermissionResponse(await this.findEntityOrFail(id));
    }

    async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
        await this.assertNameIsAvailable(createPermissionDto.name);

        const permission = this.permissionRepository.create({
            name: createPermissionDto.name,
            description: createPermissionDto.description ?? null,
        });

        return toPermissionResponse(await this.permissionRepository.save(permission));
    }

    async update(
        id: string,
        updatePermissionDto: UpdatePermissionDto,
    ): Promise<PermissionResponseDto> {
        const permission = await this.findEntityOrFail(id);

        if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
            await this.assertNameIsAvailable(updatePermissionDto.name, id);

            permission.name = updatePermissionDto.name;
        }

        // Only touch the description when the client actually sent the field.
        if (updatePermissionDto.description !== undefined) {
            permission.description = updatePermissionDto.description;
        }

        return toPermissionResponse(await this.permissionRepository.save(permission));
    }

    async remove(id: string): Promise<void> {
        const permission = await this.findEntityOrFail(id);

        // role_permissions does not cascade on delete, so refuse with a helpful
        // message instead of surfacing a foreign key error.
        if (permission.roles.length > 0) {
            const roleNames = permission.roles.map(role => role.name).join(', ');

            throw new ConflictException(
                `Permission "${permission.name}" is still assigned to these roles: ${roleNames}. Detach it from every role before deleting it.`,
            );
        }

        await this.permissionRepository.remove(permission);
    }

    private async findEntityOrFail(id: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
            relations: {
                roles: true
            },
        });

        if (!permission) throw new NotFoundException(`Permission with id "${id}" was not found`);

        return permission;
    }

    private async assertNameIsAvailable(name: string, excludeId?: string): Promise<void> {
        const existing = await this.permissionRepository.findOne({
            where: excludeId ? { name, id: Not(excludeId) } : { name },
            select: {
                id: true
            },
        });

        if (existing) throw new ConflictException(`Permission "${name}" already exists`);
    }
}
