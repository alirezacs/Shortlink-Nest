import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SettingType } from '../../enums/setting-type.enum';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  /** Value shape is checked against `type` by SettingsService. */
  @IsDefined()
  value: unknown;

  @IsEnum(SettingType)
  type: SettingType;

  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}
