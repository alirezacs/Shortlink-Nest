import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

describe('CreateRoleDto', () => {
  const validateDto = (plain: Record<string, unknown>) =>
    validate(plainToInstance(CreateRoleDto, plain));

  it('accepts a valid payload', async () => {
    const errors = await validateDto({
      name: 'content_editor',
      description: 'Publishes content',
      isActive: true,
      permissionIds: ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
    });

    expect(errors).toHaveLength(0);
  });

  it('normalizes name to lower case and trims it', async () => {
    const dto = plainToInstance(CreateRoleDto, {
      name: '  Content_Editor  ',
    });

    expect(dto.name).toBe('content_editor');
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects names with dots or spaces', async () => {
    const errors = await validateDto({ name: 'users.read' });

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects names shorter than 3 characters', async () => {
    const errors = await validateDto({ name: 'ab' });

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('stores a blank description as null', async () => {
    const dto = plainToInstance(CreateRoleDto, {
      name: 'editor',
      description: '   ',
    });

    expect(dto.description).toBeNull();
  });

  it('rejects duplicate permission ids', async () => {
    const id = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';
    const errors = await validateDto({
      name: 'editor',
      permissionIds: [id, id],
    });

    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });

  it('rejects invalid permission uuid values', async () => {
    const errors = await validateDto({
      name: 'editor',
      permissionIds: ['not-a-uuid'],
    });

    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });
});
