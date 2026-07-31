import { QueryPermissionDto } from './query-permission.dto';

describe('QueryPermissionDto', () => {
  it('defaults sortBy to name', () => {
    expect(new QueryPermissionDto().sortBy).toBe('name');
  });
});
