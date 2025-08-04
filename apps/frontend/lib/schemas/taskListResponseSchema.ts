import {z} from "zod";
import {TaskSchema} from "@/lib/schemas/task.schema";


export const TaskListResponseSchema = z.object({
    tasks: z.array(TaskSchema),
    nextPageToken: z.string().optional().nullable(),
});

export type TaskListResponseSchemaType = z.infer<typeof TaskListResponseSchema>;