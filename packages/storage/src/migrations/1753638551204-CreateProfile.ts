import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfile1753638551204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table profiles
        (
            user_id int primary key references users(id) on update cascade on delete cascade,
            first_name text not null,
            last_name text not null,
            created_at timestamp not null default now(),
            updated_at timestamp not null default now()
        );
        create trigger profile_updated_at
            before update
            on profiles
            for each row
            execute procedure set_updated_at();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            drop table profiles;`);
  }
}
