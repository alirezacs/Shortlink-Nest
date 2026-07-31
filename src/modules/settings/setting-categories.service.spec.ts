import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingCategoriesService } from './setting-categories.service';
import { SettingCategory } from './entities/setting-category.entity';
import { Setting } from './entities/setting.entity';
import { CreateSettingCategoryDto } from './dto/category/create-setting-category.dto';
import { UpdateSettingCategoryDto } from './dto/category/update-setting-category.dto';

describe('SettingCategoriesService', () => {
  let service: SettingCategoriesService;
  let categoryRepository: jest.Mocked<
    Pick<
      Repository<SettingCategory>,
      'exists' | 'create' | 'save' | 'find' | 'findOne' | 'remove'
    >
  >;
  let settingRepository: jest.Mocked<Pick<Repository<Setting>, 'exists'>>;

  const now = new Date('2026-01-01T00:00:00.000Z');

  const baseCategory = (
    overrides: Partial<SettingCategory> = {},
  ): SettingCategory =>
    ({
      id: 1,
      name: 'General',
      slug: 'general',
      description: 'General settings',
      sortOrder: 0,
      isActive: true,
      settings: [],
      createdAt: now,
      updatedAt: now,
      ...overrides,
    }) as SettingCategory;

  beforeEach(async () => {
    categoryRepository = {
      exists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    settingRepository = {
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingCategoriesService,
        {
          provide: getRepositoryToken(SettingCategory),
          useValue: categoryRepository,
        },
        {
          provide: getRepositoryToken(Setting),
          useValue: settingRepository,
        },
      ],
    }).compile();

    service = module.get(SettingCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateSettingCategoryDto = {
      name: 'General',
      slug: 'general',
      description: 'General settings',
    };

    it('creates a category when the slug is free', async () => {
      categoryRepository.exists.mockResolvedValue(false);
      const entity = baseCategory();
      categoryRepository.create.mockReturnValue(entity);
      categoryRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(categoryRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({
        id: 1,
        name: 'General',
        slug: 'general',
      });
    });

    it('throws Conflict when the slug already exists', async () => {
      categoryRepository.exists.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Category with slug "general" already exists.',
      );
    });
  });

  describe('findAll', () => {
    it('returns categories ordered by sortOrder then id', async () => {
      const categories = [baseCategory(), baseCategory({ id: 2, slug: 'auth' })];
      categoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(categoryRepository.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC', id: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('general');
    });
  });

  describe('findOne', () => {
    it('returns a mapped category', async () => {
      categoryRepository.findOne.mockResolvedValue(baseCategory());

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.slug).toBe('general');
    });

    it('throws NotFound when the category is missing', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Setting category not found.',
      );
    });
  });

  describe('update', () => {
    it('updates category fields', async () => {
      const category = baseCategory();
      categoryRepository.findOne.mockResolvedValue(category);
      categoryRepository.save.mockImplementation(
        async (entity) => entity as SettingCategory,
      );

      const dto: UpdateSettingCategoryDto = {
        name: 'General Updated',
        sortOrder: 2,
      };

      const result = await service.update(1, dto);

      expect(result.name).toBe('General Updated');
      expect(category.sortOrder).toBe(2);
    });

    it('throws Conflict when renaming slug to an existing one', async () => {
      categoryRepository.findOne.mockResolvedValue(baseCategory());
      categoryRepository.exists.mockResolvedValue(true);

      await expect(
        service.update(1, { slug: 'security' }),
      ).rejects.toThrow(ConflictException);
    });

    it('skips slug uniqueness check when the slug is unchanged', async () => {
      const category = baseCategory({ slug: 'general' });
      categoryRepository.findOne.mockResolvedValue(category);
      categoryRepository.save.mockImplementation(
        async (entity) => entity as SettingCategory,
      );

      await service.update(1, { slug: 'general', name: 'General 2' });

      expect(categoryRepository.exists).not.toHaveBeenCalled();
      expect(category.name).toBe('General 2');
    });

    it('throws NotFound when the category is missing', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes a category without settings', async () => {
      const category = baseCategory();
      categoryRepository.findOne.mockResolvedValue(category);
      settingRepository.exists.mockResolvedValue(false);
      categoryRepository.remove.mockResolvedValue(category);

      await service.remove(1);

      expect(settingRepository.exists).toHaveBeenCalledWith({
        where: { categoryId: 1 },
      });
      expect(categoryRepository.remove).toHaveBeenCalledWith(category);
    });

    it('throws Conflict when the category still has settings', async () => {
      categoryRepository.findOne.mockResolvedValue(baseCategory());
      settingRepository.exists.mockResolvedValue(true);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      await expect(service.remove(1)).rejects.toThrow(
        'This category contains settings and cannot be deleted.',
      );
      expect(categoryRepository.remove).not.toHaveBeenCalled();
    });

    it('throws NotFound when the category is missing', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
