import { SettingCategory } from '../entities/setting-category.entity';
import { SettingCategoryMapper } from './setting-category.mapper';

describe('SettingCategoryMapper', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  const entity = {
    id: 1,
    name: 'General',
    slug: 'general',
    description: 'General settings',
    sortOrder: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } as SettingCategory;

  it('maps a category entity to a response dto', () => {
    expect(SettingCategoryMapper.toResponse(entity)).toEqual({
      id: 1,
      name: 'General',
      slug: 'general',
      description: 'General settings',
      sortOrder: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('maps a list of categories', () => {
    const result = SettingCategoryMapper.toResponseList([entity]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('general');
  });
});
