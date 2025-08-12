import { afterEach, beforeEach, describe, it, expect, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import {
  FactoryGirl,
  FactoryGirlTypeOrmAdapter,
  setupPostgres,
  User,
} from '@sprint-sync/storage';
import { listUsers } from '../../src';

describe('list users', () => {
  let source: DataSource;

  beforeEach(async () => {
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
    await FactoryGirl.createMany<User>('User', 10);
  });
  afterEach(async () => {
    await source.query(`truncate users cascade`);
  });
  afterAll(async () => {
    await source.destroy();
  });

  it('returns all users if page size is 10', async () => {
    const page = await listUsers(source.manager, 10);
    expect(page.users.length).toStrictEqual(10);
    expect(page.nextPageToken).toBeNull();
    const uniqueIds = new Set(page.users.map((user) => user.id));
    expect(uniqueIds.size).toStrictEqual(10);
  });

  it('returns users with next page token', async () => {
    const page = await listUsers(source.manager, 5);
    expect(page.users.length).toStrictEqual(5);
    expect(page.nextPageToken).not.toBeNull();
    const nextPage = await listUsers(
      source.manager,
      5,
      null,
      page.nextPageToken,
    );
    expect(nextPage.users).toHaveLength(5);
    expect(nextPage.nextPageToken).toBeNull();

    const firstPageIds = new Set(page.users.map((user) => user.id));
    const nextPageIds = new Set(nextPage.users.map((user) => user.id));
    const intersection = firstPageIds.intersection(nextPageIds);
    expect(intersection.size).toStrictEqual(0);
  });
});
