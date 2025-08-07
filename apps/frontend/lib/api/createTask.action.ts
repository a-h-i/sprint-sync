'use server';

import { CreateTaskSchema } from '@/lib/schemas/createTask.schema';
import { apiFetch } from '@/lib/api/apiFetch';
import { TaskSchema } from '@/lib/schemas/task.schema';

export async function createTask(data: FormData) {
  const parsed = CreateTaskSchema.parse({
    title: data.get('title'),
    description: data.get('description'),
    status: data.get('status'),
    priority: data.get('priority'),
  });

  const response = await apiFetch('/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) {
    const body = await response.json();
    console.error({
      status: response.status,
      body: JSON.stringify(body),
    });
    throw new Error('Unknown server error');
  }
  const json = await response.json();
  return TaskSchema.parse(json);
}
