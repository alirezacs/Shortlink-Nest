import { BadRequestException } from '@nestjs/common';
import { SettingType } from '../enums/setting-type.enum';
import { SettingValueValidator } from './setting-value.validator';

describe('SettingValueValidator', () => {
  describe('STRING', () => {
    it('accepts a string', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.STRING, 'hello'),
      ).not.toThrow();
    });

    it('rejects a non-string', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.STRING, 1),
      ).toThrow(BadRequestException);
      expect(() =>
        SettingValueValidator.validate(SettingType.STRING, 1),
      ).toThrow('Setting value must be a string.');
    });
  });

  describe('NUMBER', () => {
    it('accepts a finite number', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.NUMBER, 42),
      ).not.toThrow();
    });

    it('rejects NaN and non-numbers', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.NUMBER, Number.NaN),
      ).toThrow('Setting value must be a valid number.');
      expect(() =>
        SettingValueValidator.validate(SettingType.NUMBER, '1'),
      ).toThrow(BadRequestException);
    });
  });

  describe('BOOLEAN', () => {
    it('accepts a boolean', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.BOOLEAN, true),
      ).not.toThrow();
    });

    it('rejects a non-boolean', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.BOOLEAN, 'true'),
      ).toThrow('Setting value must be a boolean.');
    });
  });

  describe('JSON', () => {
    it('accepts a plain object', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.JSON, { a: 1 }),
      ).not.toThrow();
    });

    it('rejects null, arrays and primitives', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.JSON, null),
      ).toThrow('Setting value must be a JSON object.');
      expect(() =>
        SettingValueValidator.validate(SettingType.JSON, [1]),
      ).toThrow(BadRequestException);
      expect(() =>
        SettingValueValidator.validate(SettingType.JSON, 'obj'),
      ).toThrow(BadRequestException);
    });
  });

  describe('ARRAY', () => {
    it('accepts an array', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.ARRAY, [1, 2]),
      ).not.toThrow();
    });

    it('rejects a non-array', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.ARRAY, { a: 1 }),
      ).toThrow('Setting value must be an array.');
    });
  });

  describe('ENUM', () => {
    it('accepts a string or number', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.ENUM, 'active'),
      ).not.toThrow();
      expect(() =>
        SettingValueValidator.validate(SettingType.ENUM, 1),
      ).not.toThrow();
    });

    it('rejects other types', () => {
      expect(() =>
        SettingValueValidator.validate(SettingType.ENUM, true),
      ).toThrow('Setting value must be a string or number.');
    });
  });
});
