import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSettingDto } from './update-setting.dto';

describe('UpdateSettingDto', () => {
  it('accepts a partial valid payload', async () => {
    const dto = plainToInstance(UpdateSettingDto, {
      value: 'next',
      categoryId: '2',
      description: 'updated',
      isPublic: true,
      isEditable: false,
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.categoryId).toBe(2);
    expect(dto.isPublic).toBe(true);
    expect(dto.isEditable).toBe(false);
  });

  it('accepts an empty object because every field is optional', async () => {
    const dto = plainToInstance(UpdateSettingDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a non-integer categoryId', async () => {
    const dto = plainToInstance(UpdateSettingDto, { categoryId: 'abc' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'categoryId')).toBe(true);
  });
});
