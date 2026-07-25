import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { API_VERSION_1 } from 'src/common/constants/api.constants';

// No handler is declared yet, so this controller contributes no path to the
// OpenAPI document and stays invisible in Swagger UI until one is added.
@ApiTags('Roles')
@Controller({ path: 'roles', version: API_VERSION_1 })
export class RoleController {}
