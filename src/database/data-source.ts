import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Permission } from '../modules/permission/entities/permission.entity';
import { Role } from '../modules/role/entities/role.entity';
import { User } from '../modules/user/entities/user.entity';
import { Link } from '../modules/link/entities/link.entity';
import { Setting } from '../modules/settings/entities/setting.entity';
import { SettingCategory } from '../modules/settings/entities/setting-category.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // The migration CLI loads this TypeScript file, so use class references rather
  // than a filesystem glob. This cannot scan dist, node_modules, or a parent path.
  entities: [User, Role, Permission, Link, Setting, SettingCategory],
  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});

export default AppDataSource;
