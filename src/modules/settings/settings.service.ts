import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SettingType } from './enums/setting-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { Repository } from 'typeorm';
import { SettingCategory } from './entities/setting-category.entity';
import { CreateSettingDto } from './dto/setting/create-setting.dto';
import { SettingResponseDto } from './dto/setting/setting-response.dto';
import { SettingValueValidator } from './validators/setting-value.validator';
import { SettingMapper } from './mappers/setting.mapper';
import { UpdateSettingDto } from './dto/setting/update-setting.dto';
import { LoggerService } from 'src/common/logger';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,

        @InjectRepository(SettingCategory)
        private readonly categoryRepository: Repository<SettingCategory>,

        private readonly logger: LoggerService
    ){}

    private validateSettingValue(
        type: SettingType,
        value: unknown,
    ): void {
        switch (type) {
            case SettingType.STRING:
                if (typeof value !== 'string') {
                throw new BadRequestException(
                    'Setting value must be a string.',
                );
                }
                break;

            case SettingType.NUMBER:
                if (
                typeof value !== 'number' ||
                !Number.isFinite(value)
                ) {
                throw new BadRequestException(
                    'Setting value must be a valid number.',
                );
                }
                break;

            case SettingType.BOOLEAN:
                if (typeof value !== 'boolean') {
                throw new BadRequestException(
                    'Setting value must be a boolean.',
                );
                }
                break;

            case SettingType.JSON:
                if (
                value === null ||
                typeof value !== 'object' ||
                Array.isArray(value)
                ) {
                throw new BadRequestException(
                    'Setting value must be a JSON object.',
                );
                }
                break;

            case SettingType.ARRAY:
                if (!Array.isArray(value)) {
                throw new BadRequestException(
                    'Setting value must be an array.',
                );
                }
                break;

            case SettingType.ENUM:
            if (
            typeof value !== 'string' &&
            typeof value !== 'number'
            ) {
            throw new BadRequestException(
                'Enum setting value must be a string or number.',
            );
            }
            break;
        }
    }
    
    private async findEntityById(
        id: number,
    ): Promise<Setting> {
        const setting =
            await this.settingRepository.findOne({
                where: {
                    id,
                },
                relations: {
                    category: true,
                },
            });

        if (!setting) {
            throw new NotFoundException(
            'Setting not found.',
            );
        }

        return setting;
    }

    async create(
        dto: CreateSettingDto,
    ): Promise<SettingResponseDto> {
        const exists =
            await this.settingRepository.exists({
            where: {
                key: dto.key,
            },
            });

        if (exists) {
            throw new ConflictException(
            `Setting "${dto.key}" already exists.`,
            );
        }

        const category =
            await this.categoryRepository.findOne({
            where: {
                id: dto.categoryId,
            },
            });

        if (!category) {
            throw new NotFoundException(
            'Setting category not found.',
            );
        }

        SettingValueValidator.validate(
            dto.type,
            dto.value,
        );

        const entity =
            this.settingRepository.create({
            ...dto,
            category,
            });

        const saved =
            await this.settingRepository.save(entity);

        return SettingMapper.toResponse(saved);
    }

    async findAll(): Promise<SettingResponseDto[]> {
        this.logger.log(
            'Logger test',
        );
        const settings = await this.settingRepository.find({
            relations: {
            category: true,
            },
            order: {
            key: 'ASC',
            },
        });

        return SettingMapper.toResponseList(settings);
    }

    async findOne(
        id: number,
    ): Promise<SettingResponseDto> {
        const setting = await this.findEntityById(id);

        return SettingMapper.toResponse(setting);
    }

    async update(
        id: number,
        dto: UpdateSettingDto,
    ): Promise<SettingResponseDto> {
        const setting = await this.findEntityById(id);

        if (!setting.isEditable) {
            throw new ConflictException(
            'This setting cannot be edited.',
            );
        }

        if (
            dto.categoryId &&
            dto.categoryId !== setting.categoryId
        ) {
            const category =
            await this.categoryRepository.findOne({
                where: {
                id: dto.categoryId,
                },
            });

            if (!category) {
            throw new NotFoundException(
                'Setting category not found.',
            );
            }

            setting.category = category;
        }

        const type = setting.type;
        const value = dto.value ?? setting.value;

        SettingValueValidator.validate(
            type,
            value,
        );

        Object.assign(setting, dto);

        const updated =
            await this.settingRepository.save(setting);

        return SettingMapper.toResponse(updated);
    }

    async remove(
        id: number,
    ): Promise<void> {
        const setting =
            await this.findEntityById(id);

        await this.settingRepository.remove(setting);
    }
}
