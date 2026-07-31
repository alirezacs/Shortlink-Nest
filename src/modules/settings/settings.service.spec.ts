import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { SettingCategory } from './entities/setting-category.entity';
import { SettingType } from './enums/setting-type.enum';
import { LoggerService } from '../../common/logger';
import { CreateSettingDto } from './dto/setting/create-setting.dto';
import { UpdateSettingDto } from './dto/setting/update-setting.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let settingRepository: jest.Mocked<
    Pick<
      Repository<Setting>,
      'exists' | 'findOne' | 'create' | 'save' | 'find' | 'remove'
    >
  >;
  let categoryRepository: jest.Mocked<Pick<Repository<SettingCategory>, 'findOne'>>;
  let logger: { log: jest.Mock };

  const now = new Date('2026-01-01T00:00:00.000Z');

  const category: SettingCategory = {
    id: 1,
    name: 'General',
    slug: 'general',
    description: null as never,
    sortOrder: 0,
    isActive: true,
    settings: [],
    createdAt: now,
    updatedAt: now,
  };

  const baseSetting = (overrides: Partial<Setting> = {}): Setting =>
    ({
      id: 10,
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: 1,
      category,
      description: 'App name',
      isPublic: true,
      isEditable: true,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    }) as Setting;

  beforeEach(async () => {
    settingRepository = {
      exists: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
    };

    logger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: settingRepository,
        },
        {
          provide: getRepositoryToken(SettingCategory),
          useValue: categoryRepository,
        },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateSettingDto = {
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: 1,
      description: 'App name',
      isPublic: true,
      isEditable: true,
    };

    it('creates a setting when key and category are valid', async () => {
      settingRepository.exists.mockResolvedValue(false);
      categoryRepository.findOne.mockResolvedValue(category);
      const entity = baseSetting();
      settingRepository.create.mockReturnValue(entity);
      settingRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(settingRepository.create).toHaveBeenCalledWith({
        ...dto,
        category,
      });
      expect(result).toMatchObject({
        id: 10,
        key: 'app.name',
        value: 'Shortlink',
        type: SettingType.STRING,
        categoryId: 1,
      });
    });

    it('throws Conflict when the key already exists', async () => {
      settingRepository.exists.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Setting "app.name" already exists.',
      );
      expect(categoryRepository.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFound when the category does not exist', async () => {
      settingRepository.exists.mockResolvedValue(false);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        'Setting category not found.',
      );
    });

    it('throws BadRequest when the value does not match the type', async () => {
      settingRepository.exists.mockResolvedValue(false);
      categoryRepository.findOne.mockResolvedValue(category);

      await expect(
        service.create({ ...dto, value: 123 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({ ...dto, value: 123 }),
      ).rejects.toThrow('Setting value must be a string.');
      expect(settingRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('logs and returns mapped settings ordered by key', async () => {
      const settings = [baseSetting()];
      settingRepository.find.mockResolvedValue(settings);

      const result = await service.findAll();

      expect(logger.log).toHaveBeenCalledWith('Logger test');
      expect(settingRepository.find).toHaveBeenCalledWith({
        relations: { category: true },
        order: { key: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('app.name');
    });
  });

  describe('findOne', () => {
    it('returns a mapped setting', async () => {
      settingRepository.findOne.mockResolvedValue(baseSetting());

      const result = await service.findOne(10);

      expect(result.id).toBe(10);
      expect(result.key).toBe('app.name');
    });

    it('throws NotFound when the setting is missing', async () => {
      settingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Setting not found.');
    });
  });

  describe('update', () => {
    it('updates an editable setting and validates against the stored type', async () => {
      const setting = baseSetting();
      settingRepository.findOne.mockResolvedValue(setting);
      settingRepository.save.mockImplementation(
        async (entity) => entity as Setting,
      );

      const dto: UpdateSettingDto = {
        value: 'Renamed',
        description: 'Updated',
      };

      const result = await service.update(10, dto);

      expect(result.value).toBe('Renamed');
      expect(setting.description).toBe('Updated');
    });

    it('throws Conflict when the setting is not editable', async () => {
      settingRepository.findOne.mockResolvedValue(
        baseSetting({ isEditable: false }),
      );

      await expect(
        service.update(10, { value: 'x' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(10, { value: 'x' }),
      ).rejects.toThrow('This setting cannot be edited.');
    });

    it('throws NotFound when the setting is missing', async () => {
      settingRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, { value: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFound when updating to a missing category', async () => {
      settingRepository.findOne.mockResolvedValue(baseSetting());
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(10, { categoryId: 99 }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(10, { categoryId: 99 }),
      ).rejects.toThrow('Setting category not found.');
    });

    it('throws BadRequest when the new value does not match the stored type', async () => {
      settingRepository.findOne.mockResolvedValue(baseSetting());

      await expect(
        service.update(10, { value: false }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(10, { value: false }),
      ).rejects.toThrow('Setting value must be a string.');
    });

    it('moves the setting to another category when categoryId changes', async () => {
      const setting = baseSetting();
      const otherCategory = { ...category, id: 2, slug: 'security' };
      settingRepository.findOne.mockResolvedValue(setting);
      categoryRepository.findOne.mockResolvedValue(otherCategory);
      settingRepository.save.mockImplementation(
        async (entity) => entity as Setting,
      );

      await service.update(10, { categoryId: 2 });

      expect(setting.category).toBe(otherCategory);
    });

    it('skips category lookup when categoryId is unchanged', async () => {
      const setting = baseSetting();
      settingRepository.findOne.mockResolvedValue(setting);
      settingRepository.save.mockImplementation(
        async (entity) => entity as Setting,
      );

      await service.update(10, { categoryId: 1, description: 'same category' });

      expect(categoryRepository.findOne).not.toHaveBeenCalled();
      expect(setting.description).toBe('same category');
    });

    it('keeps the stored value when value is omitted', async () => {
      const setting = baseSetting({ value: 'kept' });
      settingRepository.findOne.mockResolvedValue(setting);
      settingRepository.save.mockImplementation(
        async (entity) => entity as Setting,
      );

      const result = await service.update(10, { description: 'only desc' });

      expect(result.value).toBe('kept');
      expect(result.description).toBe('only desc');
    });
  });

  describe('remove', () => {
    it('removes an existing setting', async () => {
      const setting = baseSetting();
      settingRepository.findOne.mockResolvedValue(setting);
      settingRepository.remove.mockResolvedValue(setting);

      await service.remove(10);

      expect(settingRepository.remove).toHaveBeenCalledWith(setting);
    });

    it('throws NotFound when the setting is missing', async () => {
      settingRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateSettingValue (private helper)', () => {
    const validate = (type: SettingType, value: unknown) =>
      (service as unknown as {
        validateSettingValue: (t: SettingType, v: unknown) => void;
      }).validateSettingValue(type, value);

    it.each([
      [SettingType.STRING, 'ok'],
      [SettingType.NUMBER, 42],
      [SettingType.BOOLEAN, true],
      [SettingType.JSON, { a: 1 }],
      [SettingType.ARRAY, [1, 2]],
      [SettingType.ENUM, 'active'],
      [SettingType.ENUM, 1],
    ] as const)('accepts valid %s values', (type, value) => {
      expect(() => validate(type, value)).not.toThrow();
    });

    it.each([
      [SettingType.STRING, 1, 'Setting value must be a string.'],
      [SettingType.NUMBER, 'x', 'Setting value must be a valid number.'],
      [SettingType.NUMBER, Number.NaN, 'Setting value must be a valid number.'],
      [SettingType.BOOLEAN, 'true', 'Setting value must be a boolean.'],
      [SettingType.JSON, null, 'Setting value must be a JSON object.'],
      [SettingType.JSON, [], 'Setting value must be a JSON object.'],
      [SettingType.ARRAY, {}, 'Setting value must be an array.'],
      [SettingType.ENUM, true, 'Enum setting value must be a string or number.'],
    ] as const)('rejects invalid %s values', (type, value, message) => {
      expect(() => validate(type, value)).toThrow(BadRequestException);
      expect(() => validate(type, value)).toThrow(message);
    });
  });
});
