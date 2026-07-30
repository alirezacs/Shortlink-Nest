import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { LinkStatus } from "./enums/link-status.enum";
import { User } from "../../user/entities/user.entity";

@Entity('links')
export class Link{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('IDX_LINK_SHORT_CODE', { unique: true })
    @Column({
        name: 'short_code',
        type: 'varchar',
        length: 32,
        unique: true
    })
    shortCode: string;

    @Column({
        name: 'original_url',
        type: 'text'
    })
    originalUrl: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    title: string | null;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string | null;

    @Index('IDX_LINK_STATUS')
    @Column({
        type: 'enum',
        enum: LinkStatus,
        default: LinkStatus.ACTIVE
    })
    status: LinkStatus;

    @Column({
        name: 'password_hash',
        type: 'varchar',
        length: 255,
        nullable: true
    })
    passwordHash: string | null;

    @Column({
        name: 'max_clicks',
        type: 'integer',
        nullable: true
    })
    maxClicks: number | null;

    @Column({
        name: 'click_count',
        type: 'integer',
        default: 0
    })
    clickCount: number;

    @Index('IDX_LINK_EXPIRES_AT')
    @Column({
        name: 'expires_at',
        type: 'timestamp',
        nullable: true
    })
    expiresAt: Date | null;

    @Column({
        name: 'last_visited_at',
        type: 'timestamp',
        nullable: true,
    })
    lastVisitedAt: Date | null;

    @Index('IDX_LINK_USER')
    @ManyToOne(
        () => User,
        (user) => user.links,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'user_id',
    })
    user: Relation<User>;

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
    })
    deletedAt: Date | null;
}
