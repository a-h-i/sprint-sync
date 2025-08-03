import {z} from "zod";

export const SignupFormSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
});

export type SignupFormType = z.infer<typeof SignupFormSchema>;
