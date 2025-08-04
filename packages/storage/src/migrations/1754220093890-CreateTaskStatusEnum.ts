import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskStatusEnum1754220093890 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        create type task_status as enum ('todo', 'in_progress', 'done');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        drop type task_status;
        `);
    }

}
