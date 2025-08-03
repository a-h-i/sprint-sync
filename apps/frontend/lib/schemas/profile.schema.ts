import {z} from "zod";

export const ProfileSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
});
export type ProfileSchemaType = z.infer<typeof ProfileSchema>;