'use server';

import { apiFetch } from '@/lib/api/apiFetch';
import { cookies } from 'next/headers';
import { getCurrentUser, setCurrentUser } from '@/lib/auth/auth.service';
import { UserSchema } from '@/lib/schemas/user.schema';
import ProfileForm from '@/app/(with_sidebar)/dashboard/profile/profileForm';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const currentUser = getCurrentUser(cookieStore);

  const response = await apiFetch(`/profile/${currentUser.id}`, {
    cache: 'no-cache',
  });
  if (!response.ok) {
    throw new Error('Unknown server error');
  }
  const json = await response.json();
  const userData = UserSchema.parse(json);
  return (
    <ProfileForm
      initialFirstName={userData.profile.first_name}
      initialLastName={userData.profile.last_name}
    />
  );
}
