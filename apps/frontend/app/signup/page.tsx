'use client';



import {useState, useTransition} from "react";
import {SignupFormSchema, SignupFormType} from "@/app/signup/signup.schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {signupUser} from "@/app/signup/signup.action";
import {loginUser} from "@/app/login/login.action";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function() {
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
        })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white p-8 rounded shadow space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>

                {serverError && (
                    <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        {serverError}
                    </div>
                )}

                <div>
                    <label htmlFor="username" className="block text-sm font-medium">
                        Username
                    </label>
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
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password')}
                        className="w-full border px-3 py-2 mt-1 rounded text-sm"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium">
                        First Name
                    </label>
                    <input
                        type="text"
                        {...register('first_name')}
                        className="w-full border px-3 py-2 mt-1 rounded text-sm"
                    />
                    {errors.first_name && (
                        <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium">
                        Last Name
                    </label>
                    <input
                        type="text"
                        {...register('last_name')}
                        className="w-full border px-3 py-2 mt-1 rounded text-sm"
                    />
                    {errors.last_name && (
                        <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {isPending ? 'Creating account…' : 'Sign Up'}
                </button>

                <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </Link>
                </div>
            </form>
        </div>
    );

}


