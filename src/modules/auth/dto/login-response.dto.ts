import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
    @ApiProperty({
        description:
            'Signed JWT. Send it as `Authorization: Bearer <token>` on every protected route.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...',
    })
    accessToken: string;
}
