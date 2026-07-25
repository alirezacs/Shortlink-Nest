import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Permission } from "../entities/permission.entity";

export class PermissionRoleDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'admin' })
    name: string;
}

export class PermissionResponseDto {
    @ApiProperty({
        format: 'uuid',
        example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    })
    id: string;

    @ApiProperty({
        description: 'Dot separated identifier.',
        example: 'users.read',
    })
    name: string;

    @ApiProperty({
        nullable: true,
        example: 'Read the user directory',
    })
    description: string | null;

    // First segment of the name, exposed so the UI can group and filter without parsing.
    @ApiProperty({
        description: 'First segment of the name, so clients never parse it themselves.',
        example: 'users',
    })
    group: string;

    @ApiProperty({
        description: 'How many roles currently hold this permission.',
        example: 2,
    })
    rolesCount: number;

    // Only populated for single-permission responses.
    @ApiPropertyOptional({
        description:
            'Roles holding this permission. Returned by the single permission endpoint only, omitted from list rows.',
        type: [PermissionRoleDto],
    })
    roles?: PermissionRoleDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: Date;
}

// `roleIds` is mapped onto the entity by loadRelationIdAndMap, so it is not
// part of the entity class itself.
export type PermissionWithRolesCount = Permission & { roleIds?: string[] };

export function permissionGroup(name: string): string {
    return name.split('.')[0];
}

export function toPermissionResponse(
    permission: PermissionWithRolesCount,
): PermissionResponseDto {
    return {
        id: permission.id,
        name: permission.name,
        description: permission.description ?? null,
        group: permissionGroup(permission.name),
        rolesCount: permission.roleIds?.length ?? permission.roles?.length ?? 0,
        ...(permission.roles
            ? {
                roles: permission.roles.map(role => ({
                    id: role.id,
                    name: role.name,
                })),
            }
            : {}),
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
    };
}
