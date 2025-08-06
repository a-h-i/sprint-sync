'use client';
import {TaskStatus} from '@sprint-sync/enums';
import TaskColumn from "@/app/(with_sidebar)/dashboard/TaskColumn";
import {useState} from "react";
import CreateTaskModal from "@/lib/components/CreateTaskModal";
import {Button} from "@headlessui/react";
import {TaskSchemaType} from "@/lib/schemas/task.schema";




export default function TaskBoard() {
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const [showCreateModal, setShowCreateModal] = useState(false);
    // Store tasks grouped by status
    const [columns, setColumns] = useState<Record<TaskStatus, TaskSchemaType[]>>({
        todo: [],
        in_progress: [],
        done: [],
    });
    const handleCreate = (task: TaskSchemaType) => {
        setColumns(prev => ({
            ...prev,
            [task.status]: [task, ...prev[task.status]],
        }));
        setShowCreateModal(false);
    };

    const handleUpdate = (task: TaskSchemaType) => {
        setColumns(prev => ({
            ...prev,
            [task.status]: [task, ...prev[task.status]],
        }));
    }

    return <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Task Board</h1>
            <Button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => setShowCreateModal(true)}>Create Task</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(columns).map(([status, initialTasks]) => (
                <TaskColumn
                    key={status} status={status as TaskStatus}
                    initialTasks={initialTasks}
                    onUpdated={handleUpdate}
                />
            ))}
        </div>
        {showCreateModal && (
            <CreateTaskModal
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCreate}
            />
        )}
    </div>
}