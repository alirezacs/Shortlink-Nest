import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { loginDto } from './dto/login-dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}

    @Post('register')
    async register(@Body() registerDto: RegisterDto){
        if (!registerDto) {
            throw new BadRequestException('Request body is required');
        }

        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: loginDto){
        if (!loginDto) {
            throw new BadRequestException('Request body is required');
        }

        return this.authService.login(loginDto);
    }
}
