import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {}
