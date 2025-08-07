'use client';
import { debounce } from 'lodash';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listUsers } from '@/lib/api/list-users.action';
import { UserSchemaType } from '@/lib/schemas/user.schema';

export default function TeamPage() {
  const [users, setUsers] = useState<UserSchemaType[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(
    debounce(async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      const data = await listUsers({
          pageSize: 10,
          nextPageToken,
      });
      setUsers((prev) => prev.concat(data.users));
      setNextPageToken(data.nextPageToken ?? null);
      setHasMore(data.nextPageToken != null);
      setLoading(false);
    }, 300),
    [nextPageToken, loading, hasMore],
  );
  useEffect(() => {
    fetchMore(); // Initial load
  }, [fetchMore]);

  useEffect(() => {
    if (!observerRef.current || !nextPageToken) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMore();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef, nextPageToken, fetchMore]);

  return (
    <div className='space-y-2 p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Users</h1>

      {users.map((user) => (
        <div
          key={user.id}
          className='rounded border bg-white p-2 text-sm shadow-sm'
        >
          <strong>{user.username}</strong> – {user.profile.first_name}{' '}
          {user.profile.last_name}
        </div>
      ))}

      {loading && (
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='animate-pulse rounded border bg-gray-100 p-2'
            >
              <div className='mb-2 h-4 w-1/2 rounded bg-gray-300' />
              <div className='h-3 w-1/3 rounded bg-gray-200' />
            </div>
          ))}
        </div>
      )}

      {!nextPageToken && !loading && users.length > 0 && (
        <p className='text-center text-sm text-gray-500'>
          No more users to load.
        </p>
      )}

      <div ref={observerRef} className='h-1' />
    </div>
  );
}
