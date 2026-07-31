import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  PaginationQueryDto,
} from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  async function toDto(plain: Record<string, unknown>) {
    const dto = plainToInstance(PaginationQueryDto, plain);
    const errors = await validate(dto);
    return { dto, errors };
  }

  it('applies default page, limit, and sortOrder when omitted', async () => {
    const { dto, errors } = await toDto({});

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.limit).toBe(DEFAULT_LIMIT);
    expect(dto.sortOrder).toBe('ASC');
  });

  it('accepts valid page, limit, and sortOrder', async () => {
    const { dto, errors } = await toDto({
      page: '3',
      limit: '20',
      sortOrder: 'desc',
    });

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(20);
    expect(dto.sortOrder).toBe('DESC');
  });

  it('rejects page less than 1', async () => {
    const { errors } = await toDto({ page: 0 });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects non-integer page', async () => {
    const { errors } = await toDto({ page: 1.5 });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects limit less than 1', async () => {
    const { errors } = await toDto({ limit: 0 });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('rejects limit above MAX_LIMIT', async () => {
    const { errors } = await toDto({ limit: MAX_LIMIT + 1 });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('rejects invalid sortOrder', async () => {
    const { errors } = await toDto({ sortOrder: 'SIDEWAYS' });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'sortOrder')).toBe(true);
  });

  it('computes skip from page and limit', async () => {
    const { dto, errors } = await toDto({ page: 3, limit: 15 });

    expect(errors).toHaveLength(0);
    expect(dto.skip).toBe(30);
  });

  it('returns skip 0 for the first page', async () => {
    const { dto, errors } = await toDto({ page: 1, limit: 10 });

    expect(errors).toHaveLength(0);
    expect(dto.skip).toBe(0);
  });

  it('keeps class field defaults when constructed directly', () => {
    const dto = new PaginationQueryDto();

    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.limit).toBe(DEFAULT_LIMIT);
    expect(dto.sortOrder).toBe('ASC');
    expect(dto.skip).toBe(0);
  });

  it('leaves non-string sortOrder untouched for the validator', async () => {
    const { dto, errors } = await toDto({ sortOrder: 1 });

    expect(dto.sortOrder).toBe(1 as never);
    expect(errors.some((error) => error.property === 'sortOrder')).toBe(true);
  });
});
