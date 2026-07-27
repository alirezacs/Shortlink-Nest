import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { toOptionalBoolean, trimValue } from "../../../common/dto/transformers";

export const USER_SORT_FIELDS = [
    'firstName',
    'lastName',
    'email',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export class QueryUserDto extends PaginationQueryDto {
    // Free text search across both names and the email address.
    @ApiPropertyOptional({
        description:
            'Case insensitive substring match on first name, last name, full name and email.',
        maxLength: 100,
        example: 'ada',
    })
    @Transform(trimValue)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    // true: only active accounts, false: only deactivated ones.
    @ApiPropertyOptional({
        description:
            'true returns only active accounts, false only deactivated ones. Omit for both. Accepts `true`/`false` and `1`/`0`.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    // true: only verified addresses, false: only the ones still pending.
    @ApiPropertyOptional({
        description:
            'true returns only accounts with a verified email address, false only unverified ones. Omit for both.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Restrict to the accounts holding this role.',
        format: 'uuid',
        example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    })
    @IsOptional()
    @IsUUID()
    roleId?: string;

    @ApiPropertyOptional({
        description:
            'Column to sort on. Ties are broken by email, and accounts that never logged in sort last.',
        enum: [...USER_SORT_FIELDS],
        enumName: 'UserSortField',
        default: 'firstName',
    })
    @IsOptional()
    @IsIn(USER_SORT_FIELDS)
    sortBy: UserSortField = 'firstName';
}
