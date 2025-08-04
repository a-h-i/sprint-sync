import {TaskPriority, TaskStatus} from "@sprint-sync/storage";


export interface TaskData {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    total_minutes: number;
    assigned_to_user_id?: number | null;
}