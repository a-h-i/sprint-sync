import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@sprint-sync/enums';

export const CreateTaskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().optional(),
  priority: z.enum(TaskPriority),
  status: z.enum(TaskStatus),
});

export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>;
