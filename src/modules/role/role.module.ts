import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // Permission is registered here too: assigning permissions to a role needs the
  // entities themselves, which PermissionService does not expose.
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
