'use server';

import {TaskStatus} from "@sprint-sync/storage";
import {apiFetch} from "@/lib/api/apiFetch";
import {TaskListResponseSchema} from "@/lib/schemas/taskListResponseSchema";

interface ListTasksParams {
    status: TaskStatus,
    pageSize: number,
    nextPageToken: string | null,
}


export async function listTasks(options: ListTasksParams)  {
    const params = new URLSearchParams();
    params.append('pageSize', options.pageSize.toString());
    params.append('status', options.status);
    if (options.nextPageToken) {
        params.append('nextPageToken', options.nextPageToken);
    }
    const response = await apiFetch('/task', {}, params);
    if (!response.ok) {
        throw new Error('Unknown server error');
    }
    const json = await response.json();
    return TaskListResponseSchema.parse(json);
}