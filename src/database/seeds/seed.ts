import 'dotenv/config';
import AppDataSource from '../data-source';
import { Permission } from '../../modules/permission/entities/permission.entity';
import { Role } from '../../modules/role/entities/role.entity';
import { User } from '../../modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const permissionRepository = AppDataSource.getRepository(Permission);
  const roleRepository = AppDataSource.getRepository(Role);
  const userRepository = AppDataSource.getRepository(User);

  const permissionNames = [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
  ];

  const permissions = await Promise.all(
    permissionNames.map(async (name) => {
      const existing = await permissionRepository.findOneBy({ name });

      return (
        existing ??
        permissionRepository.save(
          permissionRepository.create({ name }),
        )
      );
    }),
  );

  let adminRole = await roleRepository.findOne({
    where: { name: 'admin' },
    relations: {
        permissions: true
    },
  });

  if (!adminRole) {
    adminRole = roleRepository.create({
      name: 'admin',
      description: 'System administrator',
      permissions,
    });
  } else {
    adminRole.permissions = permissions;
  }

  adminRole = await roleRepository.save(adminRole);

  let adminUser = await userRepository.findOne({
    where: { email: 'admin@example.com' },
    relations: {
        roles: true
    },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Alireza@1383', 10)
    adminUser = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: [adminRole],
    });
  } else {
    adminUser.roles = [adminRole];
  }

  await userRepository.save(adminUser);

  console.log('Seed completed successfully.');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});