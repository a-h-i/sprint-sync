import { EntityManager } from 'typeorm';
import { Profile, User } from '@sprint-sync/storage';
import { ProfileData } from './ProfileData';

export async function changePassword(
  manager: EntityManager,
  userId: number,
  newPassword: string,
  oldPassword: string,
): Promise<boolean> {
  const user = await manager.findOneByOrFail(User, {
    id: userId,
  });
  if (!(await user.verifyPassword(oldPassword))) {
    return false;
  }
  await user.hashPassword(newPassword);
  await manager.save(user);
  return true;
}

export async function updateProfile(
  manager: EntityManager,
  userId: number,
  profileData: ProfileData,
): Promise<void> {
  const profile = await manager.findOneByOrFail(Profile, {
    user_id: userId,
  });
  profile.first_name = profileData.first_name;
  profile.last_name = profileData.last_name;
  await manager.save(profile);
}
