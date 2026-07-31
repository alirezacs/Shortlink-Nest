import { QueryRoleDto } from './query-role.dto';

describe('QueryRoleDto', () => {
  it('defaults sortBy to name', () => {
    expect(new QueryRoleDto().sortBy).toBe('name');
  });
});
