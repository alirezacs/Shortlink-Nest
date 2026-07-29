import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Setting } from "./setting.entity";

@Entity('setting_categories')
export class SettingCategory{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'sort_order', type: 'integer', default: 0 })
    sortOrder: number;

    @Column({ name: 'is_active', type: 'bool', default: true })
    isActive: boolean;

    @OneToMany(() => Setting, setting => setting.category)
    settings: Setting[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
