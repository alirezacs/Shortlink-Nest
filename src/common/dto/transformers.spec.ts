import {
  normalizeDescription,
  normalizeEmail,
  normalizeIdentifier,
  toOptionalBoolean,
  trimValue,
} from './transformers';

describe('transformers', () => {
  describe('trimValue', () => {
    it('trims leading and trailing spaces from strings', () => {
      expect(trimValue({ value: '  hello  ' })).toBe('hello');
    });

    it('passes non-string values through unchanged', () => {
      expect(trimValue({ value: 42 })).toBe(42);
      expect(trimValue({ value: null })).toBeNull();
      expect(trimValue({ value: undefined })).toBeUndefined();
      expect(trimValue({ value: { a: 1 } })).toEqual({ a: 1 });
    });
  });

  describe('normalizeIdentifier', () => {
    it('trims and lowercases identifier strings', () => {
      expect(normalizeIdentifier({ value: '  Admin  ' })).toBe('admin');
      expect(normalizeIdentifier({ value: 'Read_Users' })).toBe('read_users');
    });

    it('passes non-string values through unchanged', () => {
      expect(normalizeIdentifier({ value: 1 })).toBe(1);
      expect(normalizeIdentifier({ value: true })).toBe(true);
    });
  });

  describe('normalizeEmail', () => {
    it('trims and lowercases email strings', () => {
      expect(normalizeEmail({ value: '  Ada@Example.com  ' })).toBe(
        'ada@example.com',
      );
    });

    it('passes non-string values through unchanged', () => {
      expect(normalizeEmail({ value: 123 })).toBe(123);
      expect(normalizeEmail({ value: null })).toBeNull();
    });
  });

  describe('normalizeDescription', () => {
    it('trims non-empty description strings', () => {
      expect(normalizeDescription({ value: '  notes  ' })).toBe('notes');
    });

    it('converts empty or whitespace-only description to null', () => {
      expect(normalizeDescription({ value: '' })).toBeNull();
      expect(normalizeDescription({ value: '   ' })).toBeNull();
    });

    it('passes non-string values through unchanged', () => {
      expect(normalizeDescription({ value: false })).toBe(false);
      expect(normalizeDescription({ value: undefined })).toBeUndefined();
    });
  });

  describe('toOptionalBoolean', () => {
    it('maps true, "true", and "1" to true', () => {
      expect(toOptionalBoolean({ value: true })).toBe(true);
      expect(toOptionalBoolean({ value: 'true' })).toBe(true);
      expect(toOptionalBoolean({ value: '1' })).toBe(true);
    });

    it('maps false, "false", and "0" to false', () => {
      expect(toOptionalBoolean({ value: false })).toBe(false);
      expect(toOptionalBoolean({ value: 'false' })).toBe(false);
      expect(toOptionalBoolean({ value: '0' })).toBe(false);
    });

    it('passes unknown values through unchanged', () => {
      expect(toOptionalBoolean({ value: 'yes' })).toBe('yes');
      expect(toOptionalBoolean({ value: 2 })).toBe(2);
      expect(toOptionalBoolean({ value: null })).toBeNull();
      expect(toOptionalBoolean({ value: undefined })).toBeUndefined();
    });
  });
});
