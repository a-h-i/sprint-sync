import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTask1754220149462 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            create type task_priority as enum ('low', 'medium', 'high'); 
            create table task
            (
                id                  serial primary key,
                title               text        not null,
                description         text,
                status              task_status not null default 'todo',
                priority            task_priority not null default 'low',
                total_minutes       integer     not null default 0,
                assigned_to_user_id integer     references users (id) on update cascade on delete set null,
                created_at          timestamp   not null default now(),
                updated_at          timestamp   not null default now()
            );
            create trigger task_updated_at
                before update
                on task
                for each row
                execute procedure set_updated_at();
            create index idx_status_task_priority_id on task (status desc, priority desc, id desc);
            create index idx_status_task_assigned_priority_id on task (assigned_to_user_id asc, status desc, priority desc, id desc);
            
            create index idx_task_priority_id on task (priority desc, id desc);
            create index idx_task_assigned_priority_id on task (assigned_to_user_id asc, priority desc, id desc);
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            drop table task;
        `);
    }

}
