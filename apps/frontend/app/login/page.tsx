'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { LoginSchema, LoginSchemaType } from '@/app/login/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '@/app/login/login.action';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Label from '@/lib/components/Label';
import Input from '@/lib/components/Input';
import {clsx} from "clsx";

export default function Page() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });
  const router = useRouter();
  const onSubmit = (data: LoginSchemaType) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    startTransition(async () => {
      try {
        await loginUser(formData);
        router.push('/dashboard');
      } catch (e: unknown) {
        if (e instanceof Error) {
          setServerError(e.message);
        } else {
          setServerError('Unknown error');
        }
      }
    });
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md space-y-4 rounded bg-white p-8 shadow'
      >
        <h1 className='text-center text-2xl font-bold'>Login</h1>

        {serverError && (
          <div className='rounded bg-red-100 p-2 text-sm text-red-700'>
            {serverError}
          </div>
        )}

        <div>
          <Label htmlFor='username'>Email</Label>
          <Input id='username' type='text' {...register('username')} />
          {errors.username && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' type='password' {...register('password')} />
          {errors.password && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isPending}
          className={clsx('w-full rounded py-2 text-white ', {
            'bg-blue-400 cursor-not-allowed': isPending,
            'bg-blue-600 hover:bg-blue-700': !isPending,
          })}
        >
          {isPending ? 'Logging in…' : 'Login'}
        </button>
        <div className='text-center text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            href='/signup'
            className='font-medium text-blue-600 hover:underline'
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
