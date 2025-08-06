'use client';


import {CreateTaskSchema, CreateTaskSchemaType} from "@/lib/schemas/createTask.schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TaskPriority, TaskStatus} from "@sprint-sync/enums";
import {useTransition} from "react";
import toast from "react-hot-toast";
import {Button, Input, Textarea} from "@headlessui/react";
import {createTask} from "@/lib/api/createTask.action";
import {TaskSchemaType} from "@/lib/schemas/task.schema";
import ModalDialog, {DialogContent, DialogHeader, DialogTitle} from "@/lib/components/ModalDialog";
import Label from "@/lib/components/Label";

interface CreateTaskModalProps {
    onClose: () => void;
    onCreated: (task: TaskSchemaType) => void;
}

export default function CreateTaskModal({onClose, onCreated}: CreateTaskModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateTaskSchemaType>({
        resolver: zodResolver(CreateTaskSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: TaskPriority.LOW,
            status: TaskStatus.TODO,
        },
    });

    const [isPending, startTransition] = useTransition();

    const onSubmit = (data: CreateTaskSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    formData.append(key, value);
                })
                const task = await createTask(formData);
                toast.success('Task created!');
                onCreated(task);
                onClose();
                reset();
            } catch (e: any) {
                toast.error('Failed to create task');
                console.error(e);
            }
        });
    };

    return (
        <ModalDialog open onClose={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Title</Label>
                        <Input {...register('title')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea {...register('description')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Priority</Label>
                            <select {...register('priority')} className="w-full border rounded p-2">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <Label>Status</Label>
                            <select {...register('status')} className="w-full border rounded p-2">
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>


                    <Button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create'}
                    </Button>
                </form>
            </DialogContent>
        </ModalDialog>
    );

}