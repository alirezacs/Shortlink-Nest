import { Permission } from "../entities/permission.entity";

export class PermissionRoleDto {
    id: string;

    name: string;
}

export class PermissionResponseDto {
    id: string;

    name: string;

    description: string | null;

    // First segment of the name, exposed so the UI can group and filter without parsing.
    group: string;

    rolesCount: number;

    // Only populated for single-permission responses.
    roles?: PermissionRoleDto[];

    createdAt: Date;

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
