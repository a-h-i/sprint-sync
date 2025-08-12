'use server';
import { cookies } from 'next/headers';
import { checkHasToken } from '@/lib/auth/auth.service';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const hasToken = checkHasToken(cookieStore);

  if (hasToken) {
    return redirect('/dashboard');
  } else {
    return redirect('/login');
  }
}
