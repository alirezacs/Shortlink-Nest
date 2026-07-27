import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class UserRoleDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'admin' })
    name: string;

    @ApiProperty({
        description: 'Deactivated roles stay assigned but are meant to be replaced.',
        example: true,
    })
    isActive: boolean;
}

export class UserResponseDto {
    @ApiProperty({
        format: 'uuid',
        example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    })
    id: string;

    @ApiProperty({ example: 'Ada' })
    firstName: string;

    @ApiProperty({ example: 'Lovelace' })
    lastName: string;

    // Both names are also sent separately, so the edit form never has to split
    // this back apart.
    @ApiProperty({
        description: 'First and last name joined, for display only.',
        example: 'Ada Lovelace',
    })
    fullName: string;

    @ApiProperty({ format: 'email', example: 'ada.lovelace@example.com' })
    email: string;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Whether `emailVerifiedAt` carries a timestamp.',
        example: true,
    })
    isEmailVerified: boolean;

    @ApiProperty({
        description: 'Null while the address is still unverified.',
        type: String,
        format: 'date-time',
        nullable: true,
        example: null,
    })
    emailVerifiedAt: Date | null;

    @ApiProperty({
        description: 'Refreshed on every successful login, null until the first one.',
        type: String,
        format: 'date-time',
        nullable: true,
    })
    lastLoginAt: Date | null;

    @ApiProperty({
        description: 'How many roles this account holds.',
        example: 2,
    })
    rolesCount: number;

    @ApiProperty({
        description:
            'Roles held by this account, sorted by name. Returned by both the list and the single account endpoint, since an account holds only a handful.',
        type: [UserRoleDto],
    })
    roles: UserRoleDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: Date;
}

/**
 * Maps an account onto its response shape.
 *
 * `password` is never read here, which is what keeps the hash out of every
 * response regardless of how the entity was loaded.
 */
export function toUserResponse(user: User): UserResponseDto {
    const roles = user.roles ?? [];

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isActive: user.isActive,
        isEmailVerified: Boolean(user.emailVerifiedAt),
        emailVerifiedAt: user.emailVerifiedAt ?? null,
        lastLoginAt: user.lastLoginAt ?? null,
        rolesCount: roles.length,
        roles: roles.map(role => ({
            id: role.id,
            name: role.name,
            isActive: role.isActive,
        })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
