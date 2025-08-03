'use server';

import {apiFetch} from "@/lib/api/apiFetch";
import {UsersListResponseSchema} from "@/lib/schemas/usersListResponseSchema";

export async function listUsers(pageSize: number, nextPageToken: string | null)  {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    if (nextPageToken) {
        params.append('nextPageToken', nextPageToken);
    }

    const response = await apiFetch('/profile', {}, params);
    const json = await response.json();

    if (!response.ok) {
        throw new Error('Unknown server error');
    }

    return UsersListResponseSchema.parse(json);
}