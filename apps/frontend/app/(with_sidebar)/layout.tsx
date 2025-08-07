'use server';
import React from 'react';
import { SidebarWrapper } from '@/app/(with_sidebar)/sidebarWrapper';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/auth.service';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const currentUser = getCurrentUser(cookieStore);
  return <SidebarWrapper currentUser={currentUser}>{children}</SidebarWrapper>;
}
