import {z} from "zod";
import {TaskPriority, TaskStatus} from "@sprint-sync/enums";

export const EditTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.enum(TaskPriority),
    status: z.enum(TaskStatus),
    total_minutes: z.number(),
});

export type EditTaskSchemaType = z.infer<typeof EditTaskSchema>;