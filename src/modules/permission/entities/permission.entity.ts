import { Role } from '../../role/entities/role.entity';
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('permissions')
export class Permission{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true,
        length: 100
    })
    name: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    description?: string | null;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];
}
