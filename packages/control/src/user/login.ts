import { EntityManager } from 'typeorm';
import { User } from '@sprint-sync/storage';

export async function login(
  manager: EntityManager,
  username: string,
  password: string,
): Promise<User | null> {
  const user = await manager.findOneBy(User, {
    username: username,
  });
  if (user == null) {
    return null;
  }
  if (await user.verifyPassword(password)) {
    return user;
  } else {
    return null;
  }
}
