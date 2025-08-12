'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/auth.service';
import { ChangePasswordSchema } from '@/lib/schemas/changePassword.schema';
import { apiFetch } from '@/lib/api/apiFetch';

export async function changePassword(formData: FormData) {
  const cookieStore = await cookies();
  const user = getCurrentUser(cookieStore);
  const data = ChangePasswordSchema.parse({
    new_password: formData.get('new_password'),
    current_password: formData.get('current_password'),
    confirm_password: formData.get('confirm_password'),
  });
  const response = await apiFetch(`/profile/${user.id}/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oldPassword: data.current_password,
      newPassword: data.new_password,
    }),
  });
  if (!response.ok) {
    const body = await response.json();
    console.error({
      status: response.status,
      body,
    });
    if (response.status === 403) {
      throw new Error('Invalid current password');
    } else {
      throw new Error('Unknown server error');
    }
  }
}
