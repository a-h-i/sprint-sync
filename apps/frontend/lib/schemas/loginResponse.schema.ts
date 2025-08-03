import {z} from "zod";
import {UserSchema} from "@/lib/schemas/user.schema";


export const LoginResponseSchema = z.object({
    user: UserSchema,
    access_token: z.string(),
});

export type LoginResponseSchemaType = z.infer<typeof LoginResponseSchema>;