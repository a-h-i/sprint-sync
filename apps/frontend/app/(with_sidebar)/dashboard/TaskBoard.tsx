'use client';
import {TaskStatus} from '@sprint-sync/enums';
import TaskColumn from "@/app/(with_sidebar)/dashboard/TaskColumn";
import {useEffect, useState} from "react";
import CreateTaskModal from "@/lib/components/CreateTaskModal";
import {Button} from "@headlessui/react";
import {TaskSchemaType} from "@/lib/schemas/task.schema";
import {listTasks} from "@/lib/api/list-tasks.action";
import toast from "react-hot-toast";


export default function TaskBoard() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tasks, setTasks] = useState<TaskSchemaType[]>([]);
    const [loading, setLoading] = useState(true);

    const handleCreate = (task: TaskSchemaType) => {
        setTasks(prev => prev.concat(task));
        setShowCreateModal(false);
    };

    const handleUpdate = (task: TaskSchemaType) => {
        console.log(task);
        setTasks(prev => {
            const index = prev.findIndex((element) => element.id === task.id);
            if (index === -1) return prev.concat([task]);
            return prev.map((element, i) => {
                if (i === index) return task;
                return element;
            });
        });
    }

    useEffect(() => {
        //initial load
        listTasks({}).then((page) => {
            setTasks(page.tasks);
            setLoading(false);
        }).catch(() => {
            toast.error('Failed to load tasks');
        });
    }, []);

    return <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Task Board</h1>
            <Button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => setShowCreateModal(true)}>Create Task</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {
                [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map(status => (
                    <TaskColumn
                        key={status} status={status}
                        tasks={tasks.filter((task) => task.status === status)}
                        onUpdated={handleUpdate}
                        loading={loading}
                    />
                ))
            }
        </div>
        {showCreateModal && (
            <CreateTaskModal
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCreate}
            />
        )}
    </div>
}