import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { loginDto } from './dto/login-dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserIdentityDto } from './dto/user-identity.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { API_VERSION_1 } from 'src/common/constants/api.constants';
import { ErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/error-response.dto';
import { JWT_AUTH_SCHEME } from 'src/common/swagger/setup-swagger';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: API_VERSION_1 })
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}

    @Post('register')
    @Public()
    @ApiOperation({
        summary: 'Register a new account',
        description:
            'Creates an account with a bcrypt hashed password. No role is attached, so the new account starts without any permission until one is granted.',
    })
    @ApiCreatedResponse({
        description: 'The account was created.',
        type: UserIdentityDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation.',
        type: ValidationErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Another account already uses this email address.',
        type: ErrorResponseDto,
    })
    async register(@Body() registerDto: RegisterDto){
        if (!registerDto) {
            throw new BadRequestException('Request body is required');
        }

        return this.authService.register(registerDto);
    }

    @Post('login')
    @Public()
    @ApiOperation({
        summary: 'Exchange credentials for an access token',
        description:
            'Verifies the credentials, stamps `lastLoginAt` and returns a signed JWT. Responds with 201 because the handler does not override the default status of POST.',
    })
    @ApiCreatedResponse({
        description: 'The credentials were accepted.',
        type: LoginResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'The payload failed validation.',
        type: ValidationErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unknown email address or wrong password.',
        type: ErrorResponseDto,
    })
    @HttpCode(200)
    async login(@Body() loginDto: loginDto){
        if (!loginDto) {
            throw new BadRequestException('Request body is required');
        }

        return this.authService.login(loginDto);
    }

    @Get('me')
    @Permissions('users.read')
    @ApiBearerAuth(JWT_AUTH_SCHEME)
    @ApiOperation({
        summary: 'Return the authenticated account',
        description:
            'Resolves the bearer token to its account, including the roles and permissions used by the RBAC guards. Requires the `users.read` permission.',
    })
    @ApiOkResponse({
        description: 'The account behind the bearer token.',
        type: ProfileResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'The bearer token is missing, expired or invalid.',
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'The account lacks the `users.read` permission.',
        type: ErrorResponseDto,
    })
    async getProfile(@CurrentUser() user: User){
        return user;
    }
}
