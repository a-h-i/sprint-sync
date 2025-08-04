import {EntityManager} from "typeorm";
import {TaskData} from "./TaskData";
import {Task} from "@sprint-sync/storage";


export async function createTask(manager: EntityManager, data: TaskData): Promise<Task> {
    const task = manager.create(Task, data);
    await manager.save(task);
    return task;
}