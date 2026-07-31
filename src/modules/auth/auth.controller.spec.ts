import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { loginDto } from './dto/login-dto';

describe('AuthController', () => {
    let controller: AuthController;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();

        controller = module.get(AuthController);
    });

    describe('register', () => {
        it('delegates to authService.register on success', async () => {
            const dto: RegisterDto = {
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
                password: 'S3cureP@ssw0rd',
            };
            const identity = {
                id: 'u1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
            };

            mockAuthService.register.mockResolvedValue(identity);

            await expect(controller.register(dto)).resolves.toEqual(identity);
            expect(mockAuthService.register).toHaveBeenCalledWith(dto);
        });

        it('throws BadRequestException when body is falsy', async () => {
            await expect(controller.register(null as unknown as RegisterDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(controller.register(null as unknown as RegisterDto)).rejects.toThrow(
                'Request body is required',
            );
            expect(mockAuthService.register).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('delegates to authService.login on success', async () => {
            const dto: loginDto = {
                email: 'ada@example.com',
                password: 'S3cureP@ssw0rd',
            };
            const tokens = { accessToken: 'signed.jwt.token' };

            mockAuthService.login.mockResolvedValue(tokens);

            await expect(controller.login(dto)).resolves.toEqual(tokens);
            expect(mockAuthService.login).toHaveBeenCalledWith(dto);
        });

        it('throws BadRequestException when body is falsy', async () => {
            await expect(controller.login(undefined as unknown as loginDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(controller.login(undefined as unknown as loginDto)).rejects.toThrow(
                'Request body is required',
            );
            expect(mockAuthService.login).not.toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('returns the user argument as-is', async () => {
            const user = {
                id: 'u1',
                email: 'ada@example.com',
            } as User;

            await expect(controller.getProfile(user)).resolves.toBe(user);
        });
    });
});
