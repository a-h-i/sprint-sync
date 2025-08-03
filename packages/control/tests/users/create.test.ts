import { afterEach, beforeEach, describe, it, expect, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import {
  setupPostgres,
  FactoryGirlTypeOrmAdapter,
  FactoryGirl,
  User,
  Profile,
} from '@sprint-sync/storage';
import { createUser } from '../../src';
import { faker } from '@faker-js/faker';

describe('create user', () => {
  let source: DataSource;

  beforeEach(async () => {
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
  });

  afterEach(async () => {
    await source.query(`truncate users cascade`);
  });

  afterAll(async () => {
    await source.destroy();
  });

  it('should create a user and profile', async () => {
    const countUsersBefore = await source.manager.count(User);
    const countProfilesBefore = await source.manager.count(Profile);
    await source.manager.transaction(async (manager) => {
      await createUser(manager, faker.internet.username(), 'password', {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      });
    });
    const countUsersAfter = await source.manager.count(User);
    const countProfilesAfter = await source.manager.count(Profile);
    expect(countUsersAfter).toStrictEqual(countUsersBefore + 1);
    expect(countProfilesAfter).toStrictEqual(countProfilesBefore + 1);
  });
});
