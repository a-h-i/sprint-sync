import { EntityManager } from 'typeorm';
import { User } from '@sprint-sync/storage';

interface UsersPage {
  users: User[];
  nextPageToken: string | null;
}

export async function listUsers(
  manager: EntityManager,
  pageSize: number,
  nextPageToken?: string,
): Promise<UsersPage> {
  let query = manager
    .createQueryBuilder()
    .select('user')
    .from(User, 'user')
    .orderBy('user.id', 'ASC')
    .limit(pageSize + 1);
  if (nextPageToken != null) {
    query = query.where('user.id >= :nextPageToken', {
      nextPageToken: nextPageToken,
    });
  }
  const users = await query.getMany();
  const page = users.slice(0, pageSize);
  if (users.length > pageSize) {
    return {
      users: page,
      nextPageToken: users[users.length - 1].id.toString(10),
    };
  } else {
    return {
      users: page,
      nextPageToken: null,
    };

  }
}
