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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
@ApiTags('Users')
@ApiBearerAuth(JWT_AUTH_SCHEME)
@ApiUnauthorizedResponse({
    description: 'The bearer token is missing, expired or invalid.',
    type: ErrorResponseDto,
})
@ApiForbiddenResponse({
    description: 'The account lacks the permission required by this route.',
    type: ErrorResponseDto,
})
@Controller({ path: 'users', version: API_VERSION_1 })
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Get()
    @Permissions('users.read')
    @ApiOperation({
        summary: 'List users',
        description:
            'Paginated directory with free text search, status, verification and role filters. Requires the `users.read` permission.',
    })
    @ApiPaginatedResponse(UserResponseDto, 'A page of users.')
    @ApiBadRequestResponse({
        description: 'A query parameter failed validation.',
        type: ValidationErrorResponseDto,
    })
    async findAll(@Query() query: QueryUserDto){
        return this.userService.findAll(query);
    }

    @Get(':id')
    @Permissions('users.read')
    @ApiOperation({
        summary: 'Get one user',
        description:
            'Returns a single account together with the roles it holds. Requires the `users.read` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the account.',
    })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiNotFoundResponse({
        description: 'No account carries this id.',
        type: ErrorResponseDto,
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.userService.findOne(id);
    }

    @Post()
    @Permissions('users.create')
    @ApiOperation({
        summary: 'Create a user',
        description:
            'Registers a new account, hashes its password and assigns the submitted roles. Requires the `users.create` permission.',
    })
    @ApiCreatedResponse({
        description: 'The account was created.',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation, or a role id is unknown.',
        type: ValidationErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Another account already uses this email address.',
        type: ErrorResponseDto,
    })
    async create(@Body() createUserDto: CreateUserDto){
        return this.userService.create(createUserDto);
    }

    @Patch(':id')
    @Permissions('users.update')
    @ApiOperation({
        summary: 'Update a user',
        description:
            'Partial update: omitted fields keep their stored value, and an omitted password keeps the stored hash. A submitted `roleIds` replaces the whole role set. Requires the `users.update` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the account.',
    })
    @ApiOkResponse({
        description: 'The updated account.',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation, or a role id is unknown.',
        type: ValidationErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No account carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Another account already uses the requested email address.',
        type: ErrorResponseDto,
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ){
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('users.delete')
    @ApiOperation({
        summary: 'Delete a user',
        description:
            'Soft deletes an account, keeping its role assignments. An account may not delete itself. Requires the `users.delete` permission.',
    })
    @ApiParam({
        name: 'id',
        format: 'uuid',
        description: 'Identifier of the account.',
    })
    @ApiNoContentResponse({ description: 'The account was deleted.' })
    @ApiNotFoundResponse({
        description: 'No account carries this id.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'The account behind the bearer token is the one being deleted.',
        type: ErrorResponseDto,
    })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: User,
    ){
        await this.userService.remove(id, currentUser.id);
    }
}
