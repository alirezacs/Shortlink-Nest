import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionGuard implements CanActivate{
    constructor(
        private readonly reflector: Reflector
    ){}

    canActivate(context: ExecutionContext): boolean{
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSION_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        )

        if(!requiredPermissions || requiredPermissions.length === 0) return true;

        const request = context.switchToHttp().getRequest()
        const user = request.user;

        if(!user) return false;

        const userPermissions = [
            ...new Set(
                user.roles.flatMap(role =>
                role.permissions.map(permission => permission.name),
                ),
            ),
        ];

        return requiredPermissions.every(permission => userPermissions.includes(permission))
    }
}