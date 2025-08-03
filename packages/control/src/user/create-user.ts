import { EntityManager } from 'typeorm';
import { ProfileData } from './ProfileData';
import { Profile, User } from '@sprint-sync/storage';

/**
 * Should be run in a transaction
 * @param manager
 * @param username
 * @param password
 * @param profile
 */
export async function createUser(
  manager: EntityManager,
  username: string,
  password: string,
  profile: ProfileData,
): Promise<{
  user: User;
  profile: Profile;
}> {
  const user = manager.create(User, { username });
  await user.hashPassword(password);
  await manager.save(user);
  const profileEntity = manager.create(Profile, {
    user_id: user.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
  });
  await manager.save(profileEntity);
  return {
    user,
    profile: profileEntity,
  };
}
