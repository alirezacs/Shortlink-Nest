import { Permissions, PERMISSION_KEY } from './permissions.decorator';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { Roles, ROLES_KEY } from './roles.decorator';

describe('metadata decorators', () => {
  it('Roles sets required role names', () => {
    class Demo {
      @Roles('admin', 'editor')
      handle() {}
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, Demo.prototype.handle);
    expect(metadata).toEqual(['admin', 'editor']);
  });

  it('Permissions sets required permission names', () => {
    class Demo {
      @Permissions('users.read', 'users.create')
      handle() {}
    }

    const metadata = Reflect.getMetadata(PERMISSION_KEY, Demo.prototype.handle);
    expect(metadata).toEqual(['users.read', 'users.create']);
  });

  it('Public marks a handler as public', () => {
    class Demo {
      @Public()
      handle() {}
    }

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, Demo.prototype.handle);
    expect(metadata).toBe(true);
  });

  it('exports stable metadata keys', () => {
    expect(ROLES_KEY).toBe('roles');
    expect(PERMISSION_KEY).toBe('permissions');
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
