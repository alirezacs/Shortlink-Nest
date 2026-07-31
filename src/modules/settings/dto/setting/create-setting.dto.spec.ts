import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSettingDto } from './create-setting.dto';
import { SettingType } from '../../enums/setting-type.enum';

describe('CreateSettingDto', () => {
  const validateDto = (plain: Record<string, unknown>) =>
    validate(plainToInstance(CreateSettingDto, plain));

  it('accepts a valid payload', async () => {
    const errors = await validateDto({
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: 1,
      description: 'App name',
      isPublic: true,
      isEditable: true,
    });

    expect(errors).toHaveLength(0);
  });

  it('coerces categoryId from a string', async () => {
    const dto = plainToInstance(CreateSettingDto, {
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: '5',
    });

    expect(dto.categoryId).toBe(5);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an empty key', async () => {
    const errors = await validateDto({
      key: '',
      value: 'x',
      type: SettingType.STRING,
      categoryId: 1,
    });

    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });

  it('rejects a missing value', async () => {
    const errors = await validateDto({
      key: 'app.name',
      type: SettingType.STRING,
      categoryId: 1,
    });

    expect(errors.some((e) => e.property === 'value')).toBe(true);
  });

  it('rejects an invalid type', async () => {
    const errors = await validateDto({
      key: 'app.name',
      value: 'x',
      type: 'unknown',
      categoryId: 1,
    });

    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('rejects a non-integer categoryId', async () => {
    const errors = await validateDto({
      key: 'app.name',
      value: 'x',
      type: SettingType.STRING,
      categoryId: 1.5,
    });

    expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
  });
});
