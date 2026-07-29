import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { SettingResponseDto } from './dto/setting/setting-response.dto';
import { CreateSettingDto } from './dto/setting/create-setting.dto';
import { UpdateSettingDto } from './dto/setting/update-setting.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller({
    path: 'settings',
    version: '1'
})
export class SettingsController {
    constructor(
        private readonly settingService: SettingsService
    ){}

    @Get()
    @Permissions('settings.read')
    @ApiOperation({
        summary: 'Get all settings'
    })
    @ApiResponse({
        status: 200,
        type: [SettingResponseDto]
    })
    async findAll(): Promise<SettingResponseDto[]>{
        return this.settingService.findAll();
    }

    @Get(':id')
    @Permissions('settings.read')
    @ApiOperation({
        summary: 'Get setting by id'
    })
    @ApiResponse({
        status: 200,
        type: SettingResponseDto
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<SettingResponseDto>{
        return this.settingService.findOne(id);
    }

    @Post()
    @Permissions('settings.create')
    @ApiOperation({
        summary: 'Create setting'
    })
    @ApiResponse({
        status: 201,
        type: SettingResponseDto
    })
    async create(@Body() dto: CreateSettingDto): Promise<SettingResponseDto>{
        return this.settingService.create(dto);
    }

    @Patch(':id')
    @Permissions('settings.update')
    @ApiOperation({
        summary: 'Update setting'
    })
    @ApiResponse({
        status: 200,
        type: SettingResponseDto
    })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSettingDto): Promise<SettingResponseDto>{
        return this.settingService.update(id, dto)
    }

    @Delete(':id')
    @Permissions('settings.delete')
    @ApiOperation({
        summary: 'Delete setting'
    })
    @ApiResponse({
        status: 204
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void>{
        return this.settingService.remove(id);
    }
}
