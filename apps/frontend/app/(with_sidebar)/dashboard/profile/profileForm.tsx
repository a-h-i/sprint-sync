'use client';


import {useTransition} from "react";
import {useForm} from "react-hook-form";
import {ProfileSchema, ProfileSchemaType} from "@/lib/schemas/profile.schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {ChangePasswordSchema, ChangePasswordSchemaType} from "@/lib/schemas/changePassword.schema";
import {updateProfile} from "@/lib/api/update-profile.action";
import toast from 'react-hot-toast';
import {changePassword} from "@/lib/api/change-password.action";

interface ProfileFormProps {
    initialFirstName: string;
    initialLastName: string;
}

export default function ProfileForm(props: ProfileFormProps) {
    const [savingInfo, startInfoTransition] = useTransition();
    const [changingPassword, startPasswordTransition] = useTransition();

    const profileForm = useForm<ProfileSchemaType>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            first_name: props.initialFirstName,
            last_name: props.initialLastName,
        }
    });

    const passwordForm = useForm<ChangePasswordSchemaType>({
        resolver: zodResolver(ChangePasswordSchema),
    });

    const onSaveInfo = (data: ProfileSchemaType) => {
        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);

        startInfoTransition(async () => {
            try {
                await updateProfile(formData);
                toast.success('Profile updated');
            } catch (e) {
                if (e instanceof Error) {
                    toast.error(e.message);
                } else {
                    console.error(e);
                    toast.error('Unknown error');
                }
            }
        });
    }

    const onChangePassword = (data: ChangePasswordSchemaType) => {
        const formData = new FormData();
        formData.append('new_password', data.new_password);
        formData.append('current_password', data.current_password);
        formData.append('confirm_password', data.confirm_password);
        startPasswordTransition(async () => {
            try {
                await changePassword(formData);
                toast.success('Password updated');
            } catch (e) {
                if (e instanceof Error) {
                    toast.error(e.message);
                } else {
                    console.error(e);
                    toast.error('Unknown error');
                }
            } finally {
                passwordForm.reset();
            }
        });
    }

    return (
        <div className="max-w-xl mx-auto p-4 space-y-8">
            <h1 className="text-2xl font-bold">Profile</h1>

            {/* Basic Info Form */}
            <form onSubmit={profileForm.handleSubmit(onSaveInfo)} className="space-y-4">
                <h2 className="text-lg font-semibold">Basic Info</h2>

                <div>
                    <label className="block text-sm font-medium">First Name</label>
                    <input
                        {...profileForm.register('first_name')}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    />
                    {profileForm.formState.errors.first_name && (
                        <p className="text-xs text-red-600 mt-1">{profileForm.formState.errors.first_name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium">Last Name</label>
                    <input
                        {...profileForm.register('last_name')}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    />
                    {profileForm.formState.errors.last_name && (
                        <p className="text-xs text-red-600 mt-1">{profileForm.formState.errors.last_name.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={savingInfo}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {savingInfo ? 'Saving...' : 'Save Changes'}
                </button>
            </form>

            {/* Change Password Form */}
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <h2 className="text-lg font-semibold">Change Password</h2>

                <div>
                    <label className="block text-sm font-medium">Current Password</label>
                    <input
                        type="password"
                        {...passwordForm.register('current_password')}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    />
                    {passwordForm.formState.errors.current_password && (
                        <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.current_password.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">New Password</label>
                    <input
                        type="password"
                        {...passwordForm.register('new_password')}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    />
                    {passwordForm.formState.errors.new_password && (
                        <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.new_password.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Confirm New Password</label>
                    <input
                        type="password"
                        {...passwordForm.register('confirm_password')}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    />
                    {passwordForm.formState.errors.confirm_password && (
                        <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.confirm_password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {changingPassword ? 'Updating...' : 'Change Password'}
                </button>
            </form>
        </div>
    );


}