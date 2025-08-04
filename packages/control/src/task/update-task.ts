import { EntityManager } from 'typeorm';
import {Task, User} from '@sprint-sync/storage';
import {TaskData} from "./TaskData";

const allowedKeys: (keyof TaskData)[] = [
    'title', 'description', 'status', 'priority', 'total_minutes'
];


export async function updateTask(
    manager: EntityManager,
    taskId: number,
    data: Partial<TaskData>
): Promise<Task> {
    const task = await manager.findOneByOrFail(Task, {
       id: taskId,
    });


    // Apply partial updates
    for (const [key, value] of Object.entries(data)) {
        if (!allowedKeys.includes(key as keyof TaskData)) {
            continue;
        }
        if (value !== undefined) {
            (task as any)[key] = value;
        }
    }

    if ('assigned_to_user_id' in data) {
        if (data.assigned_to_user_id == null) {
            task.assigned_to_user_id = null;
        } else {
            const user = await manager.findOneByOrFail(User, {
                id: data.assigned_to_user_id,
            });
            task.assigned_to_user_id = user.id;
        }
    }

    await manager.save(task);

    return task;
}