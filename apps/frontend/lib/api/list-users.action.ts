'use server';

import { apiFetch } from '@/lib/api/apiFetch';
import { UsersListResponseSchema } from '@/lib/schemas/usersListResponseSchema';

interface ListUsersParams {
  pageSize: number;
  nextPageToken?: string | null;
  username?: string | null;
}

export async function listUsers(options: ListUsersParams) {
  const params = new URLSearchParams();
  params.append('pageSize', options.pageSize.toString());
  if (options.nextPageToken) {
    params.append('nextPageToken', options.nextPageToken);
  }
  if (options.username) {
    params.append('username', options.username);
  }

  const response = await apiFetch('/profile', {}, params);
  const json = await response.json();

  if (!response.ok) {
    console.error(json);
    throw new Error('Unknown server error');
  }

  return UsersListResponseSchema.parse(json);
}
