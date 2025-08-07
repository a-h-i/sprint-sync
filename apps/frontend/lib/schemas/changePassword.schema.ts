import { z } from 'zod';

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(6, 'Current password is required'),
    new_password: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
