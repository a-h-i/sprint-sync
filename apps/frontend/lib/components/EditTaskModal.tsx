'use client';

import {TaskSchemaType} from "@/lib/schemas/task.schema";
import {EditTaskSchema, EditTaskSchemaType} from "@/lib/schemas/editTask.schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTransition} from "react";
import {updateTask} from "@/lib/api/updateTask.action";
import toast from "react-hot-toast";
import {Button, Input, Textarea} from "@headlessui/react";
import ModalDialog, {DialogContent, DialogHeader, DialogTitle} from "@/lib/components/ModalDialog";


interface EditTaskModalProps {
    task: TaskSchemaType;
    onClose: () => void;
    onUpdated: (task: TaskSchemaType) => void;
}


export default function EditTaskModal({task, onClose, onUpdated}: EditTaskModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditTaskSchemaType>({
        resolver: zodResolver(EditTaskSchema),
        defaultValues: {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            total_minutes: task.total_minutes,
        },
    });
    const [isPending, startTransition] = useTransition()

    const onSubmit = (data: EditTaskSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    formData.append(key, value.toString());
                })
                const updatedTask = await updateTask(task.id, formData);
                onUpdated(updatedTask);
                onClose();
            } catch (e: any) {
                toast.error('Failed to update task');
            }
        })
    };
    return (
        <ModalDialog open onClose={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <Input {...register('title')} />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <Textarea {...register('description')} />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Priority</label>
                            <select {...register('priority')} className="w-full border rounded p-2">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium">Status</label>
                            <select {...register('status')} className="w-full border rounded p-2">
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Total Minutes</label>
                        <Input type="number" {...register('total_minutes')} />
                    </div>

                    <Button className="bg-blue-600 text-white hover:bg-blue-700"  type="submit" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </DialogContent>
        </ModalDialog>
    );
}