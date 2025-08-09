import { FactoryGirl, Profile, User } from '@sprint-sync/storage';

export async function createUsers() {
  const profiles = await FactoryGirl.createMany<Profile>('Profile', 20);
  const adminUser = await FactoryGirl.create<User>('User', {
    is_admin: true,
    username: 'admin',
  });
  await FactoryGirl.create<Profile>('Profile', {
    user_id: adminUser.id,
  });
  return {
    profiles,
    adminUser,
  };
}
