import { PartialType } from "@nestjs/swagger";
import { CreateSettingCategoryDto } from "./create-setting-category.dto";

export class UpdateSettingCategoryDto extends PartialType(CreateSettingCategoryDto){}