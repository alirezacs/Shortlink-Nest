import { Role } from '../../role/entities/role.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 100
    })
    firstName: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 100
    })
    lastName: string;

    @Column({
        unique: true,
        length: 255
    })
    email: string;

    @Column({
        length: 255,
    })
    password: string;

    @Column({
        name: 'is_active',
        default: true
    })
    isActive: boolean;

    // Nullable on purpose: clearing the column is how an address is marked
    // unverified again, so the union has to admit null and not only undefined.
    @Column({
        name: 'email_verified_at',
        type: 'timestamp',
        nullable: true
    })
    emailVerifiedAt?: Date | null;

    @Column({
        name: 'last_login_at',
        type: 'timestamp',
        nullable: true
    })
    lastLoginAt?: Date;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: 'deleted_at'
    })
    deletedAt?: Date;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        }
    })
    roles: Role[];
}
