import { paginate } from './paginated-result.dto';

describe('paginate', () => {
  it('wraps data with pagination meta fields', () => {
    const data = [{ id: 1 }, { id: 2 }];

    const result = paginate(data, 25, 2, 10);

    expect(result.data).toBe(data);
    expect(result.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it('sets hasPreviousPage false on the first page', () => {
    const result = paginate([], 10, 1, 10);

    expect(result.meta.hasPreviousPage).toBe(false);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.totalPages).toBe(1);
  });

  it('sets hasNextPage false on the last page', () => {
    const result = paginate([{ id: 1 }], 11, 2, 10);

    expect(result.meta.totalPages).toBe(2);
    expect(result.meta.hasPreviousPage).toBe(true);
    expect(result.meta.hasNextPage).toBe(false);
  });

  it('computes totalPages with Math.ceil', () => {
    const result = paginate([], 21, 1, 10);

    expect(result.meta.totalPages).toBe(3);
  });

  it('returns totalPages 0 when limit is 0', () => {
    const result = paginate([], 100, 1, 0);

    expect(result.meta.totalPages).toBe(0);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.limit).toBe(0);
  });
});
