import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { API_VERSION_1 } from '../../common/constants/api.constants';

@Controller({ path: 'permissions', version: API_VERSION_1 })
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ){}

    @Get()
    @Permissions('permissions.read')
    async findAll(@Query() query: QueryPermissionDto){
        return this.permissionService.findAll(query);
    }

    // Declared before ':id' so "groups" is not read as an identifier.
    @Get('groups')
    @Permissions('permissions.read')
    async findGroups(){
        return this.permissionService.findGroups();
    }

    @Get(':id')
    @Permissions('permissions.read')
    async findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.permissionService.findOne(id);
    }

    @Post()
    @Permissions('permissions.create')
    async create(@Body() createPermissionDto: CreatePermissionDto){
        return this.permissionService.create(createPermissionDto);
    }

    @Patch(':id')
    @Permissions('permissions.update')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
    ){
        return this.permissionService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('permissions.delete')
    async remove(@Param('id', ParseUUIDPipe) id: string){
        await this.permissionService.remove(id);
    }
}
