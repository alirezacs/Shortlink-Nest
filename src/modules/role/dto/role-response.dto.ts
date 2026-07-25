import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "../entities/role.entity";

export class RolePermissionDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'users.read' })
    name: string;
}

export class RoleUserDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Admin User' })
    fullName: string;

    @ApiProperty({ example: 'admin@example.com' })
    email: string;
}

export class RoleResponseDto {
    @ApiProperty({
        format: 'uuid',
        example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    })
    id: string;

    @ApiProperty({
        description: 'Lower case identifier.',
        example: 'content_editor',
    })
    name: string;

    @ApiProperty({
        nullable: true,
        example: 'Publishes and edits content',
    })
    description: string | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({
        description: 'How many permissions this role grants.',
        example: 4,
    })
    permissionsCount: number;

    @ApiProperty({
        description: 'How many users currently hold this role.',
        example: 2,
    })
    usersCount: number;

    // Only populated for single-role responses.
    @ApiPropertyOptional({
        description:
            'Permissions granted by this role. Returned by the single role endpoint only, omitted from list rows.',
        type: [RolePermissionDto],
    })
    permissions?: RolePermissionDto[];

    // Only populated for single-role responses.
    @ApiPropertyOptional({
        description:
            'Users holding this role. Returned by the single role endpoint only, omitted from list rows.',
        type: [RoleUserDto],
    })
    users?: RoleUserDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: Date;
}

// `permissionIds` and `userIds` are mapped onto the entity by
// loadRelationIdAndMap, so they are not part of the entity class itself.
export type RoleWithCounts = Role & {
    permissionIds?: string[];
    userIds?: string[];
};

export function toRoleResponse(role: RoleWithCounts): RoleResponseDto {
    return {
        id: role.id,
        name: role.name,
        description: role.description ?? null,
        isActive: role.isActive,
        permissionsCount: role.permissionIds?.length ?? role.permissions?.length ?? 0,
        usersCount: role.userIds?.length ?? role.users?.length ?? 0,
        ...(role.permissions
            ? {
                permissions: role.permissions.map(permission => ({
                    id: permission.id,
                    name: permission.name,
                })),
            }
            : {}),
        ...(role.users
            ? {
                users: role.users.map(user => ({
                    id: user.id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                })),
            }
            : {}),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
    };
}
