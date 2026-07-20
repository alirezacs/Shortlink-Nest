import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { loginDto } from './dto/login-dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly userSerivice: UserService,
        private readonly jwtService: JwtService
    ){}

    async register(registerDto: RegisterDto){
        const existingUser = await this.userSerivice.findByEmail(registerDto.email);

        if(existingUser) throw new ConflictException('Email Already Exists');

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        return await this.userSerivice.create({
            ...registerDto,
            password: hashedPassword
        })
    }

    async validateUser(email: string, password: string): Promise<User>{
        const user = await this.userSerivice.findByEmailWithPassword(email);

        if(!user) throw new UnauthorizedException('Invalid Credentials');

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new UnauthorizedException('Invalid Credentials');

        return user;
    }

    async login(loginDto: loginDto){
        const user = await this.validateUser(loginDto.email, loginDto.password);

        await this.userSerivice.updateLastLogin(user.id);

        const payload = {
            sub: user.id,
            email: user.email
        }

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken
        };
    }
}
