import {z} from "zod";
import {UserSchema} from "@/lib/schemas/user.schema";
import {TaskPriority, TaskStatus} from "@sprint-sync/enums";


export const TaskSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional().nullable(),
    priority: z.enum(TaskPriority),
    status: z.enum(TaskStatus),
    assigned_to: UserSchema.optional().nullable(),
    total_minutes: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type TaskSchemaType = z.infer<typeof TaskSchema>;
