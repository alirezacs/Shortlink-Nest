import { SettingResponseDto } from "../dto/setting/setting-response.dto";
import { Setting } from "../entities/setting.entity";

export class SettingMapper {
  static toResponse(entity: Setting): SettingResponseDto {
    return {
      id: entity.id,
      key: entity.key,
      value: entity.value,
      type: entity.type,
      categoryId: entity.categoryId,
      description: entity.description,
      isPublic: entity.isPublic,
      isEditable: entity.isEditable,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(
    entities: Setting[],
  ): SettingResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}