'use server';

import { LoginSchema } from '@/app/login/login.schema';
import { cookies } from 'next/headers';
import { LoginResponseSchema } from '@/lib/schemas/loginResponse.schema';
import { setToken } from '@/lib/auth/auth.service';

export async function loginUser(formData: FormData) {
  const data = LoginSchema.parse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  // we don't want to use apiFetch here as it automatically handles 401s
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  const json = await response.json();
  const responseData = LoginResponseSchema.parse(json);

  const cookieStore = await cookies();
  setToken(cookieStore, responseData);
  return responseData.user;
}
