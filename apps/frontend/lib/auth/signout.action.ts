'use server';

import { cookies } from 'next/headers';
import { removeAuthCookies } from '@/lib/auth/auth.service';
import { redirect } from 'next/navigation';

export async function signout() {
  const cookieStore = await cookies();
  removeAuthCookies(cookieStore);
  redirect('/login');
}
