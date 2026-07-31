import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/setting/create-setting.dto';
import { UpdateSettingDto } from './dto/setting/update-setting.dto';
import { SettingType } from './enums/setting-type.enum';

describe('SettingsController', () => {
  let controller: SettingsController;
  let settingsService: jest.Mocked<
    Pick<
      SettingsService,
      'findAll' | 'findOne' | 'create' | 'update' | 'remove'
    >
  >;

  beforeEach(async () => {
    settingsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compile();

    controller = module.get(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to SettingsService', async () => {
    const expected = [{ id: 1, key: 'app.name' }];
    settingsService.findAll.mockResolvedValue(expected as never);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(settingsService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to SettingsService', async () => {
    const expected = { id: 1, key: 'app.name' };
    settingsService.findOne.mockResolvedValue(expected as never);

    await expect(controller.findOne(1)).resolves.toBe(expected);
    expect(settingsService.findOne).toHaveBeenCalledWith(1);
  });

  it('create delegates to SettingsService', async () => {
    const dto: CreateSettingDto = {
      key: 'app.name',
      value: 'Shortlink',
      type: SettingType.STRING,
      categoryId: 1,
    };
    const expected = { id: 1, ...dto };
    settingsService.create.mockResolvedValue(expected as never);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(settingsService.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to SettingsService', async () => {
    const dto: UpdateSettingDto = { value: 'Updated' };
    const expected = { id: 1, value: 'Updated' };
    settingsService.update.mockResolvedValue(expected as never);

    await expect(controller.update(1, dto)).resolves.toBe(expected);
    expect(settingsService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove delegates to SettingsService', async () => {
    settingsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(settingsService.remove).toHaveBeenCalledWith(1);
  });
});
