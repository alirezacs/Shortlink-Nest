import { BadRequestException } from "@nestjs/common";
import { SettingType } from "../enums/setting-type.enum";

export class SettingValueValidator{
    static validate(type: SettingType, value: unknown): void {
    switch (type) {
      case SettingType.STRING:
        if (typeof value !== 'string') {
          throw new BadRequestException('Setting value must be a string.');
        }
        break;

      case SettingType.NUMBER:
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException('Setting value must be a valid number.');
        }
        break;

      case SettingType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException('Setting value must be a boolean.');
        }
        break;

      case SettingType.JSON:
        if (
          value === null ||
          typeof value !== 'object' ||
          Array.isArray(value)
        ) {
          throw new BadRequestException(
            'Setting value must be a JSON object.',
          );
        }
        break;

      case SettingType.ARRAY:
        if (!Array.isArray(value)) {
          throw new BadRequestException('Setting value must be an array.');
        }
        break;

      case SettingType.ENUM:
        if (
          typeof value !== 'string' &&
          typeof value !== 'number'
        ) {
          throw new BadRequestException(
            'Setting value must be a string or number.',
          );
        }
        break;
    }
  }
}