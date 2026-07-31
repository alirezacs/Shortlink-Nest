import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

describe('CreatePermissionDto', () => {
  async function validateDto(plain: Record<string, unknown>) {
    const dto = plainToInstance(CreatePermissionDto, plain);
    return validate(dto);
  }

  it('accepts a valid permission name and normalizes it', async () => {
    const dto = plainToInstance(CreatePermissionDto, {
      name: ' Users.Read ',
      description: '  Read users  ',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('users.read');
    expect(dto.description).toBe('Read users');
  });

  it('rejects names that break the permission pattern', async () => {
    const errors = await validateDto({ name: 'Users Read' });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('rejects names shorter than 3 characters', async () => {
    const errors = await validateDto({ name: 'ab' });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('stores blank descriptions as null', async () => {
    const dto = plainToInstance(CreatePermissionDto, {
      name: 'users.read',
      description: '   ',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.description).toBeNull();
  });
});
