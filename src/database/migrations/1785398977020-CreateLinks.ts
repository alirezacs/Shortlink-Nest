import { MigrationInterface, QueryRunner, Table, TableCheck, TableForeignKey, TableIndex } from "typeorm";

export class CreateLinks1785398977020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "link_status_enum"
            AS ENUM (
                'active',
                'disabled',
                'expired'
            )
        `);

        await queryRunner.createTable(
            new Table({
                name: 'links',

                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },

                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },

                    {
                        name: 'short_code',
                        type: 'varchar',
                        length: '20',
                        isUnique: true,
                    },

                    {
                        name: 'original_url',
                        type: 'text',
                    },

                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },

                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },

                    {
                        name: 'status',
                        type: 'link_status_enum',
                        default: `'active'`,
                    },

                    {
                        name: 'password_hash',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },

                    {
                        name: 'max_clicks',
                        type: 'integer',
                        isNullable: true,
                    },

                    {
                        name: 'click_count',
                        type: 'integer',
                        default: 0,
                    },

                    {
                        name: 'expires_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },

                    {
                        name: 'last_visited_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },

                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },

                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },

                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'links',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],

                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createIndex(
            'links',
            new TableIndex({
                name: 'IDX_LINK_SHORT_CODE',
                columnNames: ['short_code'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'links',
            new TableIndex({
                name: 'IDX_LINK_USER',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createIndex(
            'links',
            new TableIndex({
                name: 'IDX_LINK_STATUS',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'links',
            new TableIndex({
                name: 'IDX_LINK_EXPIRES_AT',
                columnNames: ['expires_at'],
            }),
        );

        await queryRunner.createCheckConstraint(
            'links',
            new TableCheck({
                name: 'CHK_LINK_CLICK_COUNT',

                expression: '"click_count" >= 0',
            }),
        );

        await queryRunner.createCheckConstraint(
            'links',
            new TableCheck({
                name: 'CHK_LINK_MAX_CLICKS',

                expression:
                '"max_clicks" IS NULL OR "max_clicks" > 0',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropCheckConstraint(
            'links',
            'CHK_LINK_MAX_CLICKS',
        );

        await queryRunner.dropCheckConstraint(
            'links',
            'CHK_LINK_CLICK_COUNT',
        );

        await queryRunner.dropIndex(
            'links',
            'IDX_LINK_EXPIRES_AT',
        );

        await queryRunner.dropIndex(
            'links',
            'IDX_LINK_STATUS',
        );

        await queryRunner.dropIndex(
            'links',
            'IDX_LINK_USER',
        );

        await queryRunner.dropIndex(
            'links',
            'IDX_LINK_SHORT_CODE',
        );

        const table = await queryRunner.getTable('links');

        const foreignKey = table?.foreignKeys.find((fk) =>
            fk.columnNames.includes('user_id'),
        );

        if (foreignKey) {
            await queryRunner.dropForeignKey(
                'links',
                foreignKey,
            );
        }

        await queryRunner.dropTable('links');

        await queryRunner.query(`
            DROP TYPE "link_status_enum"
        `);
    }

}
