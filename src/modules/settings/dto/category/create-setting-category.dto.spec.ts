import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSettingCategoryDto } from './create-setting-category.dto';

describe('CreateSettingCategoryDto', () => {
  const validateDto = (plain: Record<string, unknown>) =>
    validate(plainToInstance(CreateSettingCategoryDto, plain));

  it('accepts a valid payload', async () => {
    const errors = await validateDto({
      name: 'General',
      slug: 'general',
      description: 'General settings',
      sortOrder: 1,
      isActive: true,
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts the required fields only', async () => {
    const errors = await validateDto({
      name: 'General',
      slug: 'general',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty name', async () => {
    const errors = await validateDto({
      name: '',
      slug: 'general',
    });

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects an empty slug', async () => {
    const errors = await validateDto({
      name: 'General',
      slug: '',
    });

    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('rejects a negative sortOrder', async () => {
    const errors = await validateDto({
      name: 'General',
      slug: 'general',
      sortOrder: -1,
    });

    expect(errors.some((e) => e.property === 'sortOrder')).toBe(true);
  });

  it('rejects an oversized name', async () => {
    const errors = await validateDto({
      name: 'a'.repeat(101),
      slug: 'general',
    });

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
