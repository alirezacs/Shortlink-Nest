import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { API_VERSION_1 } from 'src/common/constants/api.constants';

@Controller({ path: 'users', version: API_VERSION_1 })
export class UserController {}
