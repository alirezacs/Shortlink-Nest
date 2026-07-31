import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../user/entities/user.entity';

describe('JwtStrategy', () => {
    const mockConfig = { getOrThrow: jest.fn().mockReturnValue('secret') };
    const mockUserService = { findById: jest.fn() };

    let strategy: JwtStrategy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConfig.getOrThrow.mockReturnValue('secret');
        strategy = new JwtStrategy(mockConfig as any, mockUserService as any);
    });

    describe('validate', () => {
        it('returns user when found', async () => {
            const user = {
                id: 'u1',
                email: 'ada@example.com',
            } as User;

            mockUserService.findById.mockResolvedValue(user);

            const result = await strategy.validate({
                sub: 'u1',
                email: 'ada@example.com',
            });

            expect(mockUserService.findById).toHaveBeenCalledWith('u1');
            expect(result).toBe(user);
        });

        it('throws UnauthorizedException when user is null', async () => {
            mockUserService.findById.mockResolvedValue(null);

            await expect(
                strategy.validate({ sub: 'missing', email: 'x@example.com' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
