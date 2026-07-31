import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
    const valid = {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'S3cureP@ssw0rd',
    };

    it('accepts a valid payload', async () => {
        const dto = plainToInstance(CreateUserDto, valid);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('trims names and normalizes email', async () => {
        const dto = plainToInstance(CreateUserDto, {
            ...valid,
            firstName: '  Ada  ',
            lastName: '  Lovelace  ',
            email: '  Ada@Example.COM  ',
        });
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.firstName).toBe('Ada');
        expect(dto.lastName).toBe('Lovelace');
        expect(dto.email).toBe('ada@example.com');
    });

    it('rejects short password', async () => {
        const dto = plainToInstance(CreateUserDto, { ...valid, password: 'short' });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('rejects invalid roleIds', async () => {
        const dto = plainToInstance(CreateUserDto, {
            ...valid,
            roleIds: ['not-a-uuid'],
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'roleIds')).toBe(true);
    });

    it('accepts optional flags and roleIds', async () => {
        const dto = plainToInstance(CreateUserDto, {
            ...valid,
            isActive: false,
            isEmailVerified: true,
            roleIds: ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.isActive).toBe(false);
        expect(dto.isEmailVerified).toBe(true);
    });
});
