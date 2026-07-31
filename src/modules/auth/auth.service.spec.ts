import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { loginDto } from './dto/login-dto';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;

    const mockUserService = {
        create: jest.fn(),
        findByEmailWithPassword: jest.fn(),
        updateLastLogin: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    const userFixture = {
        id: 'u1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'hash',
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        roles: [{ id: 'r1', name: 'admin', isActive: true }],
        createdAt: new Date(),
        updatedAt: new Date(),
    } as unknown as User;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: mockUserService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    describe('register', () => {
        it('calls userService.create and returns UserIdentityDto without password', async () => {
            const registerDto: RegisterDto = {
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
                password: 'S3cureP@ssw0rd',
            };

            mockUserService.create.mockResolvedValue({
                ...userFixture,
                fullName: 'Ada Lovelace',
                isEmailVerified: false,
                rolesCount: 1,
                roles: [{ id: 'r1', name: 'admin', isActive: true }],
            });

            const result = await service.register(registerDto);

            expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual({
                id: 'u1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
            });
            expect(result).not.toHaveProperty('password');
        });
    });

    describe('validateUser', () => {
        it('returns user when credentials are valid', async () => {
            mockUserService.findByEmailWithPassword.mockResolvedValue(userFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('ada@example.com', 'plain');

            expect(mockUserService.findByEmailWithPassword).toHaveBeenCalledWith(
                'ada@example.com',
            );
            expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hash');
            expect(result).toBe(userFixture);
        });

        it('throws UnauthorizedException when user is missing', async () => {
            mockUserService.findByEmailWithPassword.mockResolvedValue(null);

            await expect(
                service.validateUser('missing@example.com', 'plain'),
            ).rejects.toThrow(new UnauthorizedException('Invalid Credentials'));
        });

        it('throws UnauthorizedException when password is bad', async () => {
            mockUserService.findByEmailWithPassword.mockResolvedValue(userFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.validateUser('ada@example.com', 'wrong'),
            ).rejects.toThrow(UnauthorizedException);

            await expect(
                service.validateUser('ada@example.com', 'wrong'),
            ).rejects.toThrow('Invalid Credentials');
        });
    });

    describe('login', () => {
        it('validates, updates last login, signs jwt and returns accessToken', async () => {
            const dto: loginDto = {
                email: 'ada@example.com',
                password: 'S3cureP@ssw0rd',
            };

            mockUserService.findByEmailWithPassword.mockResolvedValue(userFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockUserService.updateLastLogin.mockResolvedValue(undefined);
            mockJwtService.signAsync.mockResolvedValue('signed.jwt.token');

            const result = await service.login(dto);

            expect(mockUserService.updateLastLogin).toHaveBeenCalledWith('u1');
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({
                sub: 'u1',
                email: 'ada@example.com',
            });
            expect(result).toEqual({ accessToken: 'signed.jwt.token' });
        });
    });
});
