'use server';

import {TaskStatus} from "@sprint-sync/enums";
import {apiFetch} from "@/lib/api/apiFetch";
import {TaskListResponseSchema} from "@/lib/schemas/taskListResponseSchema";

interface ListTasksParams {
    status?: TaskStatus | null,
    pageSize?: number,
    nextPageToken?: string | null,
}


export async function listTasks(options: ListTasksParams)  {
    const params = new URLSearchParams();
    if (options.pageSize != null) {
        params.append('pageSize', options.pageSize.toString());
    }
    if (options.status != null) {
        params.append('status', options.status);
    }
    if (options.nextPageToken != null) {
        params.append('nextPageToken', options.nextPageToken);
    }
    const response = await apiFetch('/task', {
        cache: 'no-cache',
    }, params);
    if (!response.ok) {
        throw new Error('Unknown server error');
    }
    const json = await response.json();
    return TaskListResponseSchema.parse(json);
}