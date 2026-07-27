import { ApiProperty } from "@nestjs/swagger";
import { UserIdentityDto } from "./user-identity.dto";

export class ProfilePermissionDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({
        description: 'Dot separated permission name.',
        example: 'permissions.read',
    })
    name: string;

    @ApiProperty({ nullable: true, example: 'Read the permission catalogue' })
    description: string | null;
}

export class ProfileRoleDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'admin' })
    name: string;

    @ApiProperty({ nullable: true, example: 'Full access to the dashboard' })
    description: string | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Permissions granted by this role, resolved on every request.',
        type: [ProfilePermissionDto],
    })
    permissions: ProfilePermissionDto[];
}

/**
 * Body of `GET /api/v1/auth/me`.
 *
 * Extends `UserIdentityDto` so the identity fields are described in one place,
 * and adds the account state plus the RBAC graph loaded by the JWT strategy.
 */
export class ProfileResponseDto extends UserIdentityDto {
    @ApiProperty({
        description: 'Deactivated accounts keep their rows but cannot be used.',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Null while the address is still unverified.',
        type: String,
        format: 'date-time',
        nullable: true,
        example: null,
    })
    emailVerifiedAt: Date | null;

    @ApiProperty({
        description: 'Refreshed on every successful login.',
        type: String,
        format: 'date-time',
        nullable: true,
    })
    lastLoginAt: Date | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: Date;

    @ApiProperty({
        description: 'Roles assigned to the account, with their permissions.',
        type: [ProfileRoleDto],
    })
    roles: ProfileRoleDto[];
}
