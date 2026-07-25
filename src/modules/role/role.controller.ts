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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
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
@ApiTags('Roles')
@ApiBearerAuth(JWT_AUTH_SCHEME)
@ApiUnauthorizedResponse({
    description: 'The bearer token is missing, expired or invalid.',
    type: ErrorResponseDto,
})
@ApiForbiddenResponse({
    description: 'The account lacks the permission required by this route.',
    type: ErrorResponseDto,
})
@Controller({ path: 'roles', version: API_VERSION_1 })
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ){}

    @Get()
    @Permissions('roles.read')
    @ApiOperation({
        summary: 'List roles',
        description:
            'Paginated catalogue with free text search, status and assignment filters. Requires the `roles.read` permission.',
    })
    @ApiPaginatedResponse(RoleResponseDto, 'A page of roles.')
    @ApiBadRequestResponse({
        description: 'A query parameter failed validation.',
        type: ValidationErrorResponseDto,
    })
    async findAll(@Query() query: QueryRoleDto){
        return this.roleService.findAll(query);
    }

    @Get(':id')
    @Permissions('roles.read')
    @ApiOperation({
        summary: 'Get one role',
        description:
            'Returns a single role together with the permissions it grants and the users holding it. Requires the `roles.read` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the role.',
    })
    @ApiOkResponse({ type: RoleResponseDto })
    @ApiNotFoundResponse({
        description: 'No role carries this id.',
        type: ErrorResponseDto,
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.roleService.findOne(id);
    }

    @Post()
    @Permissions('roles.create')
    @ApiOperation({
        summary: 'Create a role',
        description:
            'Registers a new role and grants it the submitted permissions. Requires the `roles.create` permission.',
    })
    @ApiCreatedResponse({
        description: 'The role was created.',
        type: RoleResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation, or a permission id is unknown.',
        type: ValidationErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'A role with this name already exists.',
        type: ErrorResponseDto,
    })
    async create(@Body() createRoleDto: CreateRoleDto){
        return this.roleService.create(createRoleDto);
    }

    @Patch(':id')
    @Permissions('roles.update')
    @ApiOperation({
        summary: 'Update a role',
        description:
            'Partial update: omitted fields keep their stored value. A submitted `permissionIds` replaces the whole permission set. Requires the `roles.update` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the role.',
    })
    @ApiOkResponse({
        description: 'The updated role.',
        type: RoleResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation, or a permission id is unknown.',
        type: ValidationErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No role carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Another role already uses the requested name.',
        type: ErrorResponseDto,
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ){
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('roles.delete')
    @ApiOperation({
        summary: 'Delete a role',
        description:
            'Soft deletes a role, keeping its permission assignments. Detach it from every user first, the join table does not cascade. Requires the `roles.delete` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the role.',
    })
    @ApiNoContentResponse({ description: 'The role was deleted.' })
    @ApiNotFoundResponse({
        description: 'No role carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'The role is still assigned to at least one user.',
        type: ErrorResponseDto,
    })
    async remove(@Param('id', ParseUUIDPipe) id: string){
        await this.roleService.remove(id);
    }
}
