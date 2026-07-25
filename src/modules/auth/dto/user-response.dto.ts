import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
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
