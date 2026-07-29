import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SettingCategory } from "./setting-category.entity";
import { SettingType } from "../enums/setting-type.enum";

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 150 })
    key: string;

    @Column({ type: 'jsonb' })
    value: unknown;

    @Column({
        type: 'enum',
        enum: SettingType,
    })
    type: SettingType;

    @Column({ name: 'category_id', type: 'integer' })
    categoryId: number;

    @ManyToOne(() => SettingCategory, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'category_id' })
    category: SettingCategory;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'is_public', type: 'boolean', default: false })
    isPublic: boolean;

    @Column({ name: 'is_editable', type: 'boolean', default: true })
    isEditable: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
