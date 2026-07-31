import { Test, TestingModule } from '@nestjs/testing';
import { SettingCategoriesController } from './setting-categories.controller';
import { SettingCategoriesService } from './setting-categories.service';
import { CreateSettingCategoryDto } from './dto/category/create-setting-category.dto';
import { UpdateSettingCategoryDto } from './dto/category/update-setting-category.dto';

describe('SettingCategoriesController', () => {
  let controller: SettingCategoriesController;
  let categoriesService: jest.Mocked<
    Pick<
      SettingCategoriesService,
      'findAll' | 'findOne' | 'create' | 'update' | 'remove'
    >
  >;

  beforeEach(async () => {
    categoriesService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingCategoriesController],
      providers: [
        { provide: SettingCategoriesService, useValue: categoriesService },
      ],
    }).compile();

    controller = module.get(SettingCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to SettingCategoriesService', async () => {
    const expected = [{ id: 1, slug: 'general' }];
    categoriesService.findAll.mockResolvedValue(expected as never);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(categoriesService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to SettingCategoriesService', async () => {
    const expected = { id: 1, slug: 'general' };
    categoriesService.findOne.mockResolvedValue(expected as never);

    await expect(controller.findOne(1)).resolves.toBe(expected);
    expect(categoriesService.findOne).toHaveBeenCalledWith(1);
  });

  it('create delegates to SettingCategoriesService', async () => {
    const dto: CreateSettingCategoryDto = {
      name: 'General',
      slug: 'general',
    };
    const expected = { id: 1, ...dto };
    categoriesService.create.mockResolvedValue(expected as never);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(categoriesService.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to SettingCategoriesService', async () => {
    const dto: UpdateSettingCategoryDto = { name: 'Updated' };
    const expected = { id: 1, name: 'Updated' };
    categoriesService.update.mockResolvedValue(expected as never);

    await expect(controller.update(1, dto)).resolves.toBe(expected);
    expect(categoriesService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove delegates to SettingCategoriesService', async () => {
    categoriesService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(categoriesService.remove).toHaveBeenCalledWith(1);
  });
});
