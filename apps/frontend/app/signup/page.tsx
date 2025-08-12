'use client';

import { useState, useTransition } from 'react';
import { SignupFormSchema, SignupFormType } from '@/app/signup/signup.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupUser } from '@/app/signup/signup.action';
import { loginUser } from '@/app/login/login.action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Label from '@/lib/components/Label';
import Input from '@/lib/components/Input';

export default function Page() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormType>({
    resolver: zodResolver(SignupFormSchema),
  });
  const router = useRouter();
  const onSubmit = (data: SignupFormType) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
        await signupUser(formData);
        // in a production app we would require email
        // send a verification email
        // and here redirect to a page that states that an email has been sent
        // currently we just login and move on.
        await loginUser(formData);
        router.push('/dashboard');
      } catch (e) {
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
        <h1 className='text-center text-2xl font-bold'>Sign Up</h1>

        {serverError && (
          <div className='rounded bg-red-100 p-2 text-sm text-red-700'>
            {serverError}
          </div>
        )}

        <div>
          <Label htmlFor='username'>Username</Label>
          <Input type='text' {...register('username')} />
          {errors.username && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='password'>Password</Label>
          <Input type='password' {...register('password')} />
          {errors.password && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='first_name'>First Name</Label>
          <Input type='text' {...register('first_name')} />
          {errors.first_name && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='last_name'>Last Name</Label>
          <Input type='text' {...register('last_name')} />
          {errors.last_name && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.last_name.message}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700'
        >
          {isPending ? 'Creating account…' : 'Sign Up'}
        </button>

        <div className='text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-medium text-blue-600 hover:underline'
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
