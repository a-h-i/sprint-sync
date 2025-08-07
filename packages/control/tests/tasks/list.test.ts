import {
  afterEach,
  beforeEach,
  describe,
  it,
  expect,
  afterAll,
  beforeAll,
} from 'vitest';
import { DataSource } from 'typeorm';
import {
  FactoryGirl,
  FactoryGirlTypeOrmAdapter,
  setupPostgres,
  User,
  Task,
  TaskStatus,
} from '@sprint-sync/storage';
import { listTasks } from '../../src';

describe('list tasks', () => {
  let source: DataSource;
  let user: User;

  beforeAll(async () => {
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
  });

  beforeEach(async () => {
    user = await FactoryGirl.create<User>('User');

    // Create 15 tasks with mixed status
    for (let i = 0; i < 15; i++) {
      await FactoryGirl.create<Task>('Task', {
        status: i < 10 ? TaskStatus.TODO : TaskStatus.DONE,
        assigned_to_user_id: i % 3 === 0 ? user.id : null,
      });
    }
  });

  afterEach(async () => {
    await source.query('TRUNCATE task, users CASCADE');
  });

  afterAll(async () => {
    await source.destroy();
  });

  it('returns paginated TODO tasks with nextPageToken', async () => {
    const page1 = await listTasks(source.manager, {
      pageSize: 5,
      status: TaskStatus.TODO,
    });

    expect(page1.tasks.length).toBe(5);
    expect(page1.nextPageToken).not.toBeNull();

    const page2 = await listTasks(source.manager, {
      pageSize: 5,
      status: TaskStatus.TODO,
      nextPageToken: page1.nextPageToken,
    });
    expect(page2.nextPageToken).toBeNull();
    expect(page2.tasks.length).toBe(5);
  });

  it('filters TODO tasks assigned to a specific user', async () => {
    const page = await listTasks(source.manager, {
      pageSize: 20,
      status: TaskStatus.TODO,
      assignedToUserId: user.id,
    });

    expect(page.tasks.every((t) => t.assigned_to_user_id === user.id)).toBe(
      true,
    );
    expect(page.tasks.length).toBeGreaterThan(0);
  });

  it('returns empty list for unmatched status', async () => {
    const page = await listTasks(source.manager, {
      pageSize: 10,
      status: TaskStatus.IN_PROGRESS, // we didn't create any with this status
    });

    expect(page.tasks.length).toBe(0);
    expect(page.nextPageToken).toBeNull();
  });
});
