import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { loginDto } from './login-dto';

describe('loginDto', () => {
    const valid = {
        email: 'ada@example.com',
        password: 'S3cureP@ssw0rd',
    };

    it('accepts a valid payload', async () => {
        const dto = plainToInstance(loginDto, valid);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects invalid email', async () => {
        const dto = plainToInstance(loginDto, { ...valid, email: 'not-an-email' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('rejects short password', async () => {
        const dto = plainToInstance(loginDto, { ...valid, password: 'short' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('rejects missing fields', async () => {
        const dto = plainToInstance(loginDto, {});
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
