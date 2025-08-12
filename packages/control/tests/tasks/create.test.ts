import { DataSource } from 'typeorm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  FactoryGirl,
  FactoryGirlTypeOrmAdapter,
  setupPostgres,
  Task,
  TaskPriority,
  TaskStatus,
} from '@sprint-sync/storage';
import { createTask } from '../../src';
import { faker } from '@faker-js/faker';

describe('create task', () => {
  let source: DataSource;
  beforeAll(async () => {
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
  });

  afterEach(async () => {
    await source.query(`truncate task cascade`);
  });

  afterAll(async () => {
    await source.destroy();
  });

  it('should create a task', async () => {
    const countTasksBefore = await source.manager.count(Task);
    const task = await createTask(source.manager, {
      description: faker.lorem.sentence(),
      title: faker.lorem.sentence(),
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      total_minutes: 0,
    });
    const countTasksAfter = await source.manager.count(Task);
    expect(countTasksAfter).toStrictEqual(countTasksBefore + 1);
    expect(task.id).toBeDefined();
    expect(task.id).not.toBeNull();
  });
});
