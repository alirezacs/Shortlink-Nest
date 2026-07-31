import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
    const valid = {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'S3cureP@ssw0rd',
    };

    it('accepts a valid payload', async () => {
        const dto = plainToInstance(RegisterDto, valid);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects empty firstName', async () => {
        const dto = plainToInstance(RegisterDto, { ...valid, firstName: '' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'firstName')).toBe(true);
    });

    it('rejects empty lastName', async () => {
        const dto = plainToInstance(RegisterDto, { ...valid, lastName: '' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'lastName')).toBe(true);
    });

    it('rejects invalid email', async () => {
        const dto = plainToInstance(RegisterDto, { ...valid, email: 'bad' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('rejects short password', async () => {
        const dto = plainToInstance(RegisterDto, { ...valid, password: '1234567' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('rejects oversized names', async () => {
        const long = 'a'.repeat(101);
        const dto = plainToInstance(RegisterDto, {
            ...valid,
            firstName: long,
            lastName: long,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'firstName')).toBe(true);
        expect(errors.some((e) => e.property === 'lastName')).toBe(true);
    });
});
