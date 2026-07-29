import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingCategory } from './entities/setting-category.entity';
import { SettingCategoriesController } from './setting-categories.controller';
import { SettingCategoriesService } from './setting-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([ Setting, SettingCategory ])],
  controllers: [SettingCategoriesController, SettingsController],
  providers: [SettingsService, SettingCategoriesService],
  exports: [SettingsService, SettingCategoriesService]
})
export class SettingsModule {}
