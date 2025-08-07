import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {
  LoginResponseSchema,
  LoginResponseSchemaType,
} from '@/lib/schemas/loginResponse.schema';
import { UserSchema, UserSchemaType } from '@/lib/schemas/user.schema';

const AUTH_TOKEN_COOKIE = 'sprint-sync-auth-token';
const CURRENT_USER_COOKIE = 'sprint-sync-current-user';

export function checkHasToken(cookieStore: ReadonlyRequestCookies) {
  return cookieStore.has(AUTH_TOKEN_COOKIE);
}

export function getToken(cookieStore: ReadonlyRequestCookies) {
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

export function setToken(
  cookieStore: ReadonlyRequestCookies,
  data: LoginResponseSchemaType,
) {
  // cookies would be set to secure in node env if using https with a domain name
  cookieStore.set(AUTH_TOKEN_COOKIE, data.access_token, {
    httpOnly: true,
    sameSite: 'strict',
  });
  cookieStore.set(CURRENT_USER_COOKIE, JSON.stringify(data.user), {
    httpOnly: false,
    sameSite: 'strict',
  });
}

export function setCurrentUser(
  cookieStore: ReadonlyRequestCookies,
  user: UserSchemaType,
) {
  cookieStore.set(CURRENT_USER_COOKIE, JSON.stringify(user), {
    httpOnly: false,
    sameSite: 'strict',
  });
}

export function getCurrentUser(cookieStore: ReadonlyRequestCookies) {
  const jsonString = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  return UserSchema.parse(JSON.parse(jsonString ?? '{}'));
}

export function removeAuthCookies(cookieStore: ReadonlyRequestCookies) {
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(CURRENT_USER_COOKIE);
}
