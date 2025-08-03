import {z} from "zod";

import {UserSchema} from "@/lib/schemas/user.schema";


export const UsersListResponseSchema = z.object({
    nextPageToken: z.string().optional().nullable(),
    users: z.array(UserSchema)
});

export type UsersListResponseSchemaType = z.infer<typeof UsersListResponseSchema>;