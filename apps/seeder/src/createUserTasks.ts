import { FactoryGirl, Task, TaskStatus, User } from '@sprint-sync/storage';

export async function createUserTasks(user: User) {
  const todo = await FactoryGirl.createMany<Task>('Task', 10, {
    status: TaskStatus.TODO,
    assigned_to_user_id: user.id,
  });
  const inProgress = await FactoryGirl.createMany<Task>('Task', 2, {
    status: TaskStatus.IN_PROGRESS,
    assigned_to_user_id: user.id,
  });
  const done = await FactoryGirl.createMany<Task>('Task', 10, {
    status: TaskStatus.DONE,
    assigned_to_user_id: user.id,
  });

  return {
    todo,
    inProgress,
    done,
  };
}
