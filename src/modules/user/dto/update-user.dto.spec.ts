import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryUserDto } from './query-user.dto';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  it('accepts a partial valid payload', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      firstName: ' Ada ',
      email: ' Ada@Example.com ',
      isActive: '1',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.firstName).toBe('Ada');
    expect(dto.email).toBe('ada@example.com');
    expect(dto.isActive).toBe(true);
  });

  it('rejects empty firstName when provided', async () => {
    const dto = plainToInstance(UpdateUserDto, { firstName: '' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'firstName')).toBe(true);
  });

  it('rejects short passwords', async () => {
    const dto = plainToInstance(UpdateUserDto, { password: 'short' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});

describe('QueryUserDto', () => {
  it('keeps the default sortBy when constructed directly', () => {
    const dto = new QueryUserDto();

    expect(dto.sortBy).toBe('firstName');
  });

  it('accepts valid filters and inherits pagination defaults', async () => {
    const dto = plainToInstance(QueryUserDto, {
      search: ' ada ',
      isActive: 'true',
      roleId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      sortBy: 'email',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('ada');
    expect(dto.isActive).toBe(true);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('rejects invalid sortBy values', async () => {
    const dto = plainToInstance(QueryUserDto, { sortBy: 'password' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'sortBy')).toBe(true);
  });

  it('rejects non-uuid roleId values', async () => {
    const dto = plainToInstance(QueryUserDto, { roleId: 'not-a-uuid' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'roleId')).toBe(true);
  });
});
