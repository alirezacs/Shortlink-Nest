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
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { API_VERSION_1 } from '../../common/constants/api.constants';
import {
    ErrorResponseDto,
    ValidationErrorResponseDto,
} from '../../common/dto/error-response.dto';
import { JWT_AUTH_SCHEME } from '../../common/swagger/setup-swagger';

// Every route below is guarded, so the bearer requirement and the two auth
// failures are declared once for the whole controller.
@ApiTags('Permissions')
@ApiBearerAuth(JWT_AUTH_SCHEME)
@ApiUnauthorizedResponse({
    description: 'The bearer token is missing, expired or invalid.',
    type: ErrorResponseDto,
})
@ApiForbiddenResponse({
    description: 'The account lacks the permission required by this route.',
    type: ErrorResponseDto,
})
@Controller({ path: 'permissions', version: API_VERSION_1 })
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ){}

    @Get()
    @Permissions('permissions.read')
    @ApiOperation({
        summary: 'List permissions',
        description:
            'Paginated catalogue with free text search, group and assignment filters. Requires the `permissions.read` permission.',
    })
    @ApiPaginatedResponse(PermissionResponseDto, 'A page of permissions.')
    @ApiBadRequestResponse({
        description: 'A query parameter failed validation.',
        type: ValidationErrorResponseDto,
    })
    async findAll(@Query() query: QueryPermissionDto){
        return this.permissionService.findAll(query);
    }

    // Declared before ':id' so "groups" is not read as an identifier.
    @Get('groups')
    @Permissions('permissions.read')
    @ApiOperation({
        summary: 'List permission groups',
        description:
            'Distinct first segments of every permission name, sorted alphabetically. Feeds the group filter of the list endpoint.',
    })
    @ApiOkResponse({
        description: 'Every known group.',
        type: String,
        isArray: true,
    })
    async findGroups(){
        return this.permissionService.findGroups();
    }

    @Get(':id')
    @Permissions('permissions.read')
    @ApiOperation({
        summary: 'Get one permission',
        description:
            'Returns a single permission together with the roles that hold it. Requires the `permissions.read` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the permission.',
    })
    @ApiOkResponse({ type: PermissionResponseDto })
    @ApiNotFoundResponse({
        description: 'No permission carries this id.',
        type: ErrorResponseDto,
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.permissionService.findOne(id);
    }

    @Post()
    @Permissions('permissions.create')
    @ApiOperation({
        summary: 'Create a permission',
        description:
            'Registers a new permission name. Requires the `permissions.create` permission.',
    })
    @ApiCreatedResponse({
        description: 'The permission was created.',
        type: PermissionResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation.',
        type: ValidationErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'A permission with this name already exists.',
        type: ErrorResponseDto,
    })
    async create(@Body() createPermissionDto: CreatePermissionDto){
        return this.permissionService.create(createPermissionDto);
    }

    @Patch(':id')
    @Permissions('permissions.update')
    @ApiOperation({
        summary: 'Update a permission',
        description:
            'Partial update: omitted fields keep their stored value. Requires the `permissions.update` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the permission.',
    })
    @ApiOkResponse({
        description: 'The updated permission.',
        type: PermissionResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation.',
        type: ValidationErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No permission carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Another permission already uses the requested name.',
        type: ErrorResponseDto,
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
    ){
        return this.permissionService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('permissions.delete')
    @ApiOperation({
        summary: 'Delete a permission',
        description:
            'Removes a permission permanently. Detach it from every role first, the join table does not cascade. Requires the `permissions.delete` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the permission.',
    })
    @ApiNoContentResponse({ description: 'The permission was deleted.' })
    @ApiNotFoundResponse({
        description: 'No permission carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'The permission is still assigned to at least one role.',
        type: ErrorResponseDto,
    })
    async remove(@Param('id', ParseUUIDPipe) id: string){
        await this.permissionService.remove(id);
    }
}
