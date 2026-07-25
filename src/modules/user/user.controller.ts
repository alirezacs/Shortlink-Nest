import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { API_VERSION_1 } from 'src/common/constants/api.constants';

// No handler is declared yet, so this controller contributes no path to the
// OpenAPI document and stays invisible in Swagger UI until one is added.
@ApiTags('Users')
@Controller({ path: 'users', version: API_VERSION_1 })
export class UserController {}
