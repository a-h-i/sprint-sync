import {checkHasToken, getToken} from "@/lib/auth/auth.service";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

/**
 * Handles redirect if token expires
 * or becomes invalid
 * @param path
 * @param init
 * @param searchParams
 */
export async function apiFetch(path: string, init: RequestInit = {}, searchParams?: URLSearchParams) {
    const url = new URL(path, process.env.API_URL);
    if (searchParams) {
        url.search = searchParams.toString();
    }
    const cookieStore = await cookies();
    if (!checkHasToken(cookieStore)) {
        return redirect('/login');
    }
    const token = getToken(cookieStore);
    const headers = {
        ...init.headers,
    } as Record<string, string>;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
        ...init,
        headers,
    });

    if (response.status === 401) {
        return redirect('/login');
    }
    return response;

}