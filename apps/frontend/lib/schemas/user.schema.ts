import {z} from "zod";
import {ProfileSchema} from "@/lib/schemas/profile.schema";

export const UserSchema = z.object({
    id: z.number(),
    username: z.string().min(1),
    profile: ProfileSchema,
    is_admin: z.boolean(),
});
export type UserSchemaType = z.infer<typeof UserSchema>;