import {
  afterEach,
  describe,
  it,
  expect,
  afterAll,
  beforeEach,
  beforeAll,
} from 'vitest';
import { DataSource } from 'typeorm';
import {
  FactoryGirl,
  FactoryGirlTypeOrmAdapter,
  setupPostgres,
  Task,
  TaskPriority,
  TaskStatus,
  User,
} from '@sprint-sync/storage';
import { updateTask } from '../../src';

describe('update task', () => {
  let source: DataSource;
  let task: Task;
  let user: User;

  beforeAll(async () => {
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
  });

  beforeEach(async () => {
    user = await FactoryGirl.create<User>('User');
    task = await FactoryGirl.create<Task>('Task');
  });
  afterEach(async () => {
    await source.query('truncate task, users cascade');
  });

  afterAll(async () => {
    await source.destroy();
  });

  it('updates all basic fields', async () => {
    const updated = await updateTask(source.manager, task.id, {
      title: 'Updated title',
      description: 'Updated description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      total_minutes: 42,
    });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Updated title');
    expect(updated.description).toBe('Updated description');
    expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
    expect(updated.priority).toBe(TaskPriority.HIGH);
    expect(updated.total_minutes).toBe(42);
  });

  it('updates only a single field', async () => {
    const updated = await updateTask(source.manager, task.id, {
      title: 'Partially updated',
    });

    expect(updated.title).toBe('Partially updated');
    expect(updated.description).toBe(task.description);
  });

  it('assigns a user to task', async () => {
    const updated = await updateTask(source.manager, task.id, {
      assigned_to_user_id: user.id,
    });

    expect(updated.assigned_to_user_id).toBe(user.id);
    expect(await updated.assigned_to).toMatchObject({ id: user.id });
  });

  it('unassigns the task user', async () => {
    // First assign
    await updateTask(source.manager, task.id, {
      assigned_to_user_id: user.id,
    });

    // Then unassign
    const updated = await updateTask(source.manager, task.id, {
      assigned_to_user_id: null,
    });

    expect(updated.assigned_to_user_id).toBeNull();
    expect(await updated.assigned_to).toBeNull();
  });

  it('throws when task not found', async () => {
    await expect(() =>
      updateTask(source.manager, 99999, { title: 'Nope' }),
    ).rejects.toThrow();
  });

  it('throws when assigning to non-existent user', async () => {
    await expect(() =>
      updateTask(source.manager, task.id, { assigned_to_user_id: 99999 }),
    ).rejects.toThrow();
  });
});
