import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SettingCategoryResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    description: string;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
