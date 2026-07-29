import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettings1785265499656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "setting_type_enum" AS ENUM (
                'string',
                'number',
                'boolean',
                'json',
                'array',
                'enum'
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "setting_categories" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "slug" character varying(100) NOT NULL,
                "description" text,
                "sort_order" integer NOT NULL DEFAULT 0,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_setting_categories_id"
                PRIMARY KEY ("id"),
                CONSTRAINT "UQ_setting_categories_slug"
                UNIQUE ("slug")
            )
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_setting_categories_sort_order"
            ON "setting_categories" ("sort_order")
        `)

        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" SERIAL NOT NULL,
                "key" character varying(150) NOT NULL,
                "value" jsonb NOT NULL,
                "type" "setting_type_enum" NOT NULL,
                "category_id" integer NOT NULL,
                "description" text,
                "is_public" boolean NOT NULL DEFAULT false,
                "is_editable" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_settings_id"
                PRIMARY KEY ("id"),
                CONSTRAINT "UQ_settings_key"
                UNIQUE ("key"),
                CONSTRAINT "FK_settings_category_id"
                FOREIGN KEY ("category_id")
                REFERENCES "setting_categories" ("id")
                ON DELETE RESTRICT
                ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_settings_category_id"
            ON "settings" ("category_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_settings_category_id"
        `);

        await queryRunner.query(`
            DROP TABLE "settings"
        `);

        await queryRunner.query(`
            DROP INDEX "public"."IDX_setting_categories_sort_order"
        `);

        await queryRunner.query(`
            DROP TABLE "setting_categories"
        `);

        await queryRunner.query(`
            DROP TYPE "setting_type_enum"
        `);
    }

}
