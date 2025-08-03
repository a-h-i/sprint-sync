import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1753638547505 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            create table users
            (
                id            SERIAL PRIMARY KEY,
                username      TEXT      NOT NULL,
                password_hash TEXT      NOT NULL,
                is_admin      BOOLEAN   NOT NULL DEFAULT FALSE,
                created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
            );
            create trigger user_updated_at
                before update
                on users
                for each row
                execute procedure set_updated_at();
            create unique index user_username_uindex on users (username);       
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE users;
        `);
  }
}
