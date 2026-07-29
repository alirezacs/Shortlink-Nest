import { DataSource } from 'typeorm';

import { Permission } from '../../modules/permission/entities/permission.entity';
import { Role } from '../../modules/role/entities/role.entity';
import { User } from '../../modules/user/entities/user.entity';

import { Setting } from '../../modules/settings/entities/setting.entity';
import { SettingCategory } from '../../modules/settings/entities/setting-category.entity';

import { SettingType } from '../../modules/settings/enums/setting-type.enum';

import * as bcrypt from 'bcrypt';

import AppDataSource from '../data-source';

export async function seed(dataSource: DataSource) {  

  const permissionRepository =
    dataSource.getRepository(Permission);

  const roleRepository =
    dataSource.getRepository(Role);

  const userRepository =
    dataSource.getRepository(User);

  const settingCategoryRepository =
    dataSource.getRepository(SettingCategory);

  const settingRepository =
    dataSource.getRepository(Setting);


  /*
  |--------------------------------------------------------------------------
  | Permissions
  |--------------------------------------------------------------------------
  */

  const permissions = [

    // Users
    {
      name: 'users.read',
      description: 'View users',
    },
    {
      name: 'users.create',
      description: 'Create users',
    },
    {
      name: 'users.update',
      description: 'Update users',
    },
    {
      name: 'users.delete',
      description: 'Delete users',
    },


    // Roles
    {
      name: 'roles.read',
      description: 'View roles',
    },
    {
      name: 'roles.create',
      description: 'Create roles',
    },
    {
      name: 'roles.update',
      description: 'Update roles',
    },
    {
      name: 'roles.delete',
      description: 'Delete roles',
    },


    // Permissions
    {
      name: 'permissions.read',
      description: 'View permissions',
    },
    {
      name: 'permissions.create',
      description: 'Create permissions',
    },
    {
      name: 'permissions.update',
      description: 'Update permissions',
    },
    {
      name: 'permissions.delete',
      description: 'Delete permissions',
    },


    // Settings
    {
      name: 'settings.read',
      description: 'View settings',
    },
    {
      name: 'settings.create',
      description: 'Create settings',
    },
    {
      name: 'settings.update',
      description: 'Update settings',
    },
    {
      name: 'settings.delete',
      description: 'Delete settings',
    },


    // Setting Categories
    {
      name: 'settings.categories.read',
      description: 'View setting categories',
    },
    {
      name: 'settings.categories.create',
      description: 'Create setting categories',
    },
    {
      name: 'settings.categories.update',
      description: 'Update setting categories',
    },
    {
      name: 'settings.categories.delete',
      description: 'Delete setting categories',
    },

  ];


  const savedPermissions: Permission[] = [];


  for (const permissionData of permissions) {

    let permission =
      await permissionRepository.findOne({
        where: {
          name: permissionData.name,
        },
      });


    if (!permission) {

      permission =
        permissionRepository.create(permissionData);

      permission =
        await permissionRepository.save(permission);
    }


    savedPermissions.push(permission);
  }



  /*
  |--------------------------------------------------------------------------
  | Admin Role
  |--------------------------------------------------------------------------
  */


  let adminRole =
    await roleRepository.findOne({
      where: {
        name: 'admin',
      },
      relations: {
        permissions: true,
      },
    });


  if (!adminRole) {

    adminRole =
      roleRepository.create({
        name: 'admin',
        description: 'System administrator',
        permissions: savedPermissions,
      });


    adminRole =
      await roleRepository.save(adminRole);

  } else {

    adminRole.permissions =
      savedPermissions;

    await roleRepository.save(adminRole);
  }



  /*
  |--------------------------------------------------------------------------
  | Admin User
  |--------------------------------------------------------------------------
  */


  let adminUser =
    await userRepository.findOne({
      where: {
        email: 'admin@example.com',
      },
    });


  if (!adminUser) {

    const password =
      await bcrypt.hash(
        'Admin@123456',
        10,
      );


    adminUser =
      userRepository.create({
        email: 'admin@example.com',
        password,
        firstName: 'Admin',
        lastName: 'User',
        roles: [
          adminRole,
        ],
      });


    await userRepository.save(adminUser);
  }



  /*
  |--------------------------------------------------------------------------
  | Setting Categories
  |--------------------------------------------------------------------------
  */


  const categories = [

    {
      name: 'General',
      slug: 'general',
      description: 'General application settings',
      sortOrder: 1,
    },

    {
      name: 'Security',
      slug: 'security',
      description: 'Security related settings',
      sortOrder: 2,
    },

    {
      name: 'Links',
      slug: 'links',
      description: 'Short link settings',
      sortOrder: 3,
    },

    {
      name: 'SEO',
      slug: 'seo',
      description: 'SEO settings',
      sortOrder: 4,
    },

    {
      name: 'Email',
      slug: 'email',
      description: 'Email settings',
      sortOrder: 5,
    },

    {
      name: 'System',
      slug: 'system',
      description: 'System settings',
      sortOrder: 6,
    },

  ];


  const savedCategories = {};


  for (const categoryData of categories) {

    let category =
      await settingCategoryRepository.findOne({
        where: {
          slug: categoryData.slug,
        },
      });


    if (!category) {

      category =
        settingCategoryRepository.create(
          categoryData,
        );

      category =
        await settingCategoryRepository.save(
          category,
        );
    }


    savedCategories[category.slug] =
      category;
  }



  /*
  |--------------------------------------------------------------------------
  | Settings
  |--------------------------------------------------------------------------
  */


  const settings = [

    {
      key: 'site.name',
      value: 'ShortLink',
      type: SettingType.STRING,
      category: savedCategories['general'],
    },


    {
      key: 'site.url',
      value: 'http://localhost:3000',
      type: SettingType.STRING,
      category: savedCategories['general'],
    },


    {
      key: 'links.default_length',
      value: 6,
      type: SettingType.NUMBER,
      category: savedCategories['links'],
    },


    {
      key: 'links.case_sensitive',
      value: false,
      type: SettingType.BOOLEAN,
      category: savedCategories['links'],
    },


    {
      key: 'links.default_redirect_type',
      value: 302,
      type: SettingType.NUMBER,
      category: savedCategories['links'],
    },


    {
      key: 'security.max_login_attempts',
      value: 5,
      type: SettingType.NUMBER,
      category: savedCategories['security'],
    },


    {
      key: 'email.from_name',
      value: 'ShortLink',
      type: SettingType.STRING,
      category: savedCategories['email'],
    },


    {
      key: 'email.from_address',
      value: 'noreply@example.com',
      type: SettingType.STRING,
      category: savedCategories['email'],
    },

  ];


  for (const settingData of settings) {

    const exists =
      await settingRepository.findOne({
        where: {
          key: settingData.key,
        },
      });


    if (!exists) {

      const setting =
        settingRepository.create(
          settingData,
        );


      await settingRepository.save(
        setting,
      );
    }
  }


  console.log(
    'Database seeded successfully',
  );
}

