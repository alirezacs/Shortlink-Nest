import { generateRequestId } from './request-id.util';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateRequestId', () => {
  it('returns a UUID-like string', () => {
    const id = generateRequestId();

    expect(typeof id).toBe('string');
    expect(id).toMatch(UUID_V4_PATTERN);
  });

  it('returns unique values across calls', () => {
    const ids = new Set(
      Array.from({ length: 20 }, () => generateRequestId()),
    );

    expect(ids.size).toBe(20);
  });
});
