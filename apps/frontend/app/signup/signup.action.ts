'use server';


import {SignupFormSchema} from "@/app/signup/signup.schema";

import {UserSchema} from "@/lib/schemas/user.schema";

export async function signupUser(formData: FormData) {
    const data = SignupFormSchema.parse({
        username: formData.get('username'),
        password: formData.get('password'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
    });

    const response = await fetch(`${process.env.API_URL}/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.status == 422) {
        throw new Error('Username already taken');
    }
    if (!response.ok) {
        throw new Error('Unknown error');
    }
    const json = await response.json();
    return UserSchema.parse(json);
}