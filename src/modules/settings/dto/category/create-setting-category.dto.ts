import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateSettingCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    sortOrder?: number;
    
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}