import { SettingType } from '../enums/setting-type.enum';
import { Setting } from '../entities/setting.entity';
import { SettingMapper } from './setting.mapper';

describe('SettingMapper', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  const entity = {
    id: 10,
    key: 'app.name',
    value: 'Shortlink',
    type: SettingType.STRING,
    categoryId: 1,
    description: 'App name',
    isPublic: true,
    isEditable: false,
    createdAt: now,
    updatedAt: now,
  } as Setting;

  it('maps a setting entity to a response dto', () => {
    expect(SettingMapper.toResponse(entity)).toEqual({
      id: 10,
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: 1,
      description: 'App name',
      isPublic: true,
      isEditable: false,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('maps a list of settings', () => {
    const result = SettingMapper.toResponseList([entity]);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('app.name');
  });
});
