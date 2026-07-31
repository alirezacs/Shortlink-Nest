import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

function getParamDecoratorFactory(
  decorator: (...data: unknown[]) => ParameterDecorator,
) {
  class Test {
    public test(@decorator() _value: unknown) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser', () => {
  const factory = getParamDecoratorFactory(CurrentUser);

  it('returns request.user from the HTTP context', () => {
    const user = { id: '1', email: 'user@example.com' };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;

    expect(factory(null, ctx)).toEqual(user);
  });

  it('returns undefined when request has no user', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(factory(null, ctx)).toBeUndefined();
  });
});
