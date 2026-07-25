import { Controller } from '@nestjs/common';
import { API_VERSION_1 } from 'src/common/constants/api.constants';

@Controller({ path: 'roles', version: API_VERSION_1 })
export class RoleController {}
