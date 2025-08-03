'use client';
import {debounce} from "lodash";


import {useCallback, useEffect, useRef, useState} from "react";
import {listUsers} from "@/lib/api/list-users.action";
import {UserSchemaType} from "@/lib/schemas/user.schema";

export default function TeamPage() {
    const [users, setUsers] = useState<UserSchemaType[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const fetchMore = useCallback(
        debounce(async () => {
            if (loading) return;
            setLoading(true);
            const data = await listUsers(10, nextPageToken);
            setUsers(prev => prev.concat(data.users));
            setNextPageToken(data.nextPageToken ?? null);
            setLoading(false);
        }, 300),
        [nextPageToken, loading]
    );
    useEffect(() => {
        fetchMore(); // Initial load
    }, []);

    useEffect(() => {
        if (!observerRef.current || !nextPageToken) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchMore();
            }
        });

        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [observerRef.current, nextPageToken, fetchMore]);

    return (
        <div className="p-4 space-y-2">
            <h1 className="text-2xl font-bold mb-4">Users</h1>

            {users.map(user => (
                <div
                    key={user.id}
                    className="p-2 border rounded shadow-sm bg-white text-sm"
                >
                    <strong>{user.username}</strong> – {user.profile.first_name} {user.profile.last_name}
                </div>
            ))}

            {loading && (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse p-2 border rounded bg-gray-100">
                            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            )}

            {!nextPageToken && !loading && users.length > 0 && (
                <p className="text-sm text-center text-gray-500">No more users to load.</p>
            )}

            <div ref={observerRef} className="h-1" />
        </div>
    );
}