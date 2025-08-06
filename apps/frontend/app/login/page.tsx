'use client';


import {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {LoginSchema, LoginSchemaType} from "@/app/login/login.schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginUser} from "@/app/login/login.action";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Label from "@/lib/components/Label";

export default function() {
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema)
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white p-8 rounded shadow space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Login</h1>

                {serverError && (
                    <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        {serverError}
                    </div>
                )}

                <div>
                    <Label htmlFor="username">
                        Email
                    </Label>
                    <input
                        type="text"
                        {...register('username')}
                        className="w-full border px-3 py-2 mt-1 rounded text-sm"
                    />
                    {errors.username && (
                        <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="password">
                        Password
                    </Label>
                    <input
                        type="password"
                        {...register('password')}
                        className="w-full border px-3 py-2 mt-1 rounded text-sm"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {isPending ? 'Logging in…' : 'Login'}
                </button>
                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );

}