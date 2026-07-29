import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SettingCategory } from "./entities/setting-category.entity";
import { Repository } from "typeorm";
import { Setting } from "./entities/setting.entity";
import { CreateSettingCategoryDto } from "./dto/category/create-setting-category.dto";
import { UpdateSettingCategoryDto } from "./dto/category/update-setting-category.dto";
import { SettingCategoryResponseDto } from "./dto/category/setting-category-response.dto";
import { SettingCategoryMapper } from "./mappers/setting-category.mapper";

@Injectable()
export class SettingCategoriesService {
  constructor(
    @InjectRepository(SettingCategory)
    private readonly categoryRepository: Repository<SettingCategory>,

    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /**
   * Private helper for fetching an entity.
   * Internal methods work with Entity, not DTO.
   */
  private async findEntityById(
    id: number,
  ): Promise<SettingCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        'Setting category not found.',
      );
    }

    return category;
  }

  /**
   * Create Category
   */
  async create(
    dto: CreateSettingCategoryDto,
  ): Promise<SettingCategoryResponseDto> {
    const exists = await this.categoryRepository.exists({
      where: {
        slug: dto.slug,
      },
    });

    if (exists) {
      throw new ConflictException(
        `Category with slug "${dto.slug}" already exists.`,
      );
    }

    const category = this.categoryRepository.create(dto);

    const saved =
      await this.categoryRepository.save(category);

    return SettingCategoryMapper.toResponse(saved);
  }

  /**
   * Get All Categories
   */
  async findAll(): Promise<SettingCategoryResponseDto[]> {
    const categories =
      await this.categoryRepository.find({
        order: {
          sortOrder: 'ASC',
          id: 'ASC',
        },
      });

    return SettingCategoryMapper.toResponseList(
      categories,
    );
  }

  /**
   * Get Category By Id
   */
  async findOne(
    id: number,
  ): Promise<SettingCategoryResponseDto> {
    const category =
      await this.findEntityById(id);

    return SettingCategoryMapper.toResponse(category);
  }

  /**
   * Update Category
   */
  async update(
    id: number,
    dto: UpdateSettingCategoryDto,
  ): Promise<SettingCategoryResponseDto> {
    const category =
      await this.findEntityById(id);

    if (
      dto.slug &&
      dto.slug !== category.slug
    ) {
      const exists =
        await this.categoryRepository.exists({
          where: {
            slug: dto.slug,
          },
        });

      if (exists) {
        throw new ConflictException(
          `Category with slug "${dto.slug}" already exists.`,
        );
      }
    }

    Object.assign(category, dto);

    const updated =
      await this.categoryRepository.save(category);

    return SettingCategoryMapper.toResponse(updated);
  }

  /**
   * Delete Category
   */
  async remove(id: number): Promise<void> {
    const category =
      await this.findEntityById(id);

    const hasSettings =
      await this.settingRepository.exists({
        where: {
          categoryId: category.id,
        },
      });

    if (hasSettings) {
      throw new ConflictException(
        'This category contains settings and cannot be deleted.',
      );
    }

    await this.categoryRepository.remove(category);
  }
}
