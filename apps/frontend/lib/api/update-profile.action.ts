'use server';

import { ProfileSchema } from '@/lib/schemas/profile.schema';
import { apiFetch } from '@/lib/api/apiFetch';
import { cookies } from 'next/headers';
import { getCurrentUser, setCurrentUser } from '@/lib/auth/auth.service';
import { UserSchema } from '@/lib/schemas/user.schema';

export async function updateProfile(formData: FormData) {
  const data = ProfileSchema.parse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
  });
  const cookieStore = await cookies();
  const user = getCurrentUser(cookieStore);
  const response = await apiFetch(`/profile/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json();
    console.error({
      status: response.status,
      body,
    });
    throw new Error('Unknown server error');
  }
  const json = await response.json();
  const updatedUserData = UserSchema.parse(json);
  setCurrentUser(cookieStore, updatedUserData);
}
