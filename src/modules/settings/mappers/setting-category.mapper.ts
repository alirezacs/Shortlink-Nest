import { SettingCategoryResponseDto } from "../dto/category/setting-category-response.dto";
import { SettingCategory } from "../entities/setting-category.entity";

export class SettingCategoryMapper {
  static toResponse(
    entity: SettingCategory,
  ): SettingCategoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      sortOrder: entity.sortOrder,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(
    entities: SettingCategory[],
  ): SettingCategoryResponseDto[] {
    return entities.map(this.toResponse);
  }
}