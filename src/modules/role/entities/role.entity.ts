import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('roles')
export class Role{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true,
        length: 100
    })
    name: string;

    // `type` is spelled out because the union below hides the column type from
    // TypeORM's reflection. The stored column is unchanged: varchar(255) NULL.
    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    description?: string | null;

    @Column({
        name: 'is_active',
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        nullable: true
    })
    deletedAt?: Date;

    @ManyToMany(() => User, user => user.roles)
    users: User[];

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id'
        }
    })
    permissions: Permission[];
}
