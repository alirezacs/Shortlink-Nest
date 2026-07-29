import { ApiProperty } from '@nestjs/swagger';

import { SettingType } from '../../enums/setting-type.enum';

export class SettingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: unknown;

  @ApiProperty({
    enum: SettingType,
  })
  type: SettingType;

  @ApiProperty()
  categoryId: number;

  @ApiProperty({
    required: false,
  })
  description: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  isEditable: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
