'use client';
import {TaskStatus} from "@sprint-sync/enums";
import {TaskSchemaType} from "@/lib/schemas/task.schema";
import TaskCard from "@/lib/components/TaskCard";
import TaskCardSkeleton from "@/lib/components/TaskCardSkeleton";

interface TaskColumnProps {
    status: TaskStatus;
    tasks: TaskSchemaType[];
    onUpdated: (task: TaskSchemaType) => void;
    loading: boolean;
}

const labelMap = {
    [TaskStatus.TODO]: 'To do',
    [TaskStatus.IN_PROGRESS]: 'In progress',
    [TaskStatus.DONE]: 'Done',
}

export default function TaskColumn(props: TaskColumnProps) {


    return (
        <div className="bg-white rounded-lg shadow-md p-3 flex flex-col gap-2">
            <h2 className="text-lg font-semibold capitalize text-center">
                {labelMap[props.status]}
            </h2>
            <div className="flex-1 flex flex-col gap-2">
                {props.tasks.map(task => (
                    <TaskCard key={task.id} task={task} onUpdated={props.onUpdated}/>
                ))}
                {props.loading && (
                    <>
                        <TaskCardSkeleton/>
                        <TaskCardSkeleton/>
                        <TaskCardSkeleton/>
                    </>
                )}
            </div>
        </div>
    )
}