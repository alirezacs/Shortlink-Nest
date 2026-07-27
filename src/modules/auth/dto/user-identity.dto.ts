import { ApiProperty } from "@nestjs/swagger";

/**
 * The identity fields every account endpoint returns.
 *
 * Named after what it holds rather than where it is returned: the user module
 * owns `UserResponseDto` (the whole account, with status and roles) and two
 * classes cannot share a name in one OpenAPI document.
 */
export class UserIdentityDto {
    @ApiProperty({
        description: 'Identifier of the account.',
        format: 'uuid',
        example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    })
    id: string;

    @ApiProperty({ example: 'Ada' })
    firstName: string;

    @ApiProperty({ example: 'Lovelace' })
    lastName: string;

    @ApiProperty({ format: 'email', example: 'ada.lovelace@example.com' })
    email: string;
}
