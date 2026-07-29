import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SettingCategoriesService } from "./setting-categories.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { CreateSettingCategoryDto } from "./dto/category/create-setting-category.dto";
import { UpdateSettingCategoryDto } from "./dto/category/update-setting-category.dto";
import { SettingCategoryResponseDto } from "./dto/category/setting-category-response.dto";

@ApiTags('Setting Categories')
@ApiBearerAuth()
@Controller({
    path: 'settings/categories',
    version: '1'
})
export class SettingCategoriesController{
    constructor(
        private readonly categoriesService: SettingCategoriesService
    ){}

    @Get()
    @Permissions('settings.categories.read')
    @ApiOperation({
        summary: 'Get all setting categories',
    })
    @ApiResponse({
        status: 200,
        type: [SettingCategoryResponseDto],
    })
    async findAll(): Promise<SettingCategoryResponseDto[]> {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    @Permissions('settings.categories.read')
    @ApiOperation({
        summary: 'Get setting category by id',
    })
    @ApiResponse({
        status: 200,
        type: SettingCategoryResponseDto,
    })
    async findOne(
    @Param('id', ParseIntPipe)
        id: number,
    ): Promise<SettingCategoryResponseDto> {
        return this.categoriesService.findOne(id);
    }

    @Post()
    @Permissions('settings.categories.create')
    @ApiOperation({
        summary: 'Create setting category',
    })
    @ApiResponse({
        status: 201,
        type: SettingCategoryResponseDto,
    })
    async create(
        @Body()
        dto: CreateSettingCategoryDto,
    ): Promise<SettingCategoryResponseDto> {
        return this.categoriesService.create(dto);
    }

    @Patch(':id')
    @Permissions('settings.categories.update')
    @ApiOperation({
        summary: 'Update setting category',
    })
    @ApiResponse({
        status: 200,
        type: SettingCategoryResponseDto,
    })
    async update(
    @Param('id', ParseIntPipe)
        id: number,
        @Body()
        dto: UpdateSettingCategoryDto,
    ): Promise<SettingCategoryResponseDto> {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('settings.categories.delete')
    @ApiOperation({
        summary: 'Delete setting category',
    })
    @ApiResponse({
        status: 204,
    })
    async remove(
    @Param('id', ParseIntPipe)
        id: number,
    ): Promise<void> {
        return this.categoriesService.remove(id);
    }
}
