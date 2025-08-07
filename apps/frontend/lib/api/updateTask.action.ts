'use server';



import {EditTaskSchema} from "@/lib/schemas/editTask.schema";
import {apiFetch} from "@/lib/api/apiFetch";
import {TaskSchema} from "@/lib/schemas/task.schema";

export async function updateTask(id: number, data: FormData) {
    const parsed = EditTaskSchema.parse({
        title: data.get('title'),
        description: data.get('description'),
        status: data.get('status'),
        priority: data.get('priority'),
        total_minutes: parseInt(data.get('total_minutes') as string, 10),
    });

    const response = await apiFetch(`/task/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
    });
    if (!response.ok) {
        const body = await response.json();
        console.error({
            status: response.status,
            body,
        });
        throw new Error('Unknown server error');
    }
    const json = await response.json();
    return TaskSchema.parse(json);
}