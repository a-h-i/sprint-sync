'use server';

import { EditTaskSchemaType } from '@/lib/schemas/editTask.schema';
import { apiFetch } from '@/lib/api/apiFetch';
import { TaskSchema } from '@/lib/schemas/task.schema';

export async function updateTask(id: number, data: EditTaskSchemaType) {
  const response = await apiFetch(`/task/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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
