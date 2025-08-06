'use client';
import {TaskStatus} from "@sprint-sync/enums";
import {debounce} from "lodash";
import {useCallback, useEffect, useRef, useState} from "react";
import {TaskSchemaType} from "@/lib/schemas/task.schema";
import {listTasks} from "@/lib/api/list-tasks.action";
import TaskCard from "@/lib/components/TaskCard";
import TaskCardSkeleton from "@/lib/components/TaskCardSkeleton";

interface TaskColumnProps {
    status: TaskStatus;
    initialTasks: TaskSchemaType[];
    onUpdated: (task: TaskSchemaType) => void;
}

const labelMap = {
    [TaskStatus.TODO]: 'To do',
    [TaskStatus.IN_PROGRESS]: 'In progress',
    [TaskStatus.DONE]: 'Done',
}

export default function TaskColumn(props: TaskColumnProps) {
    const [tasks, setTasks] = useState<TaskSchemaType[]>(props.initialTasks);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const fetchMore = useCallback(
        debounce(async () => {
            if (loading || !hasMore) return;
            setLoading(true);
            const data = await listTasks({
                status: props.status,
                pageSize: 10,
                nextPageToken: nextPageToken,
            });
            setTasks(prev => prev.concat(data.tasks));
            setNextPageToken(data.nextPageToken ?? null);
            setHasMore(data.nextPageToken != null);
            setLoading(false);
        }, 300),
        [nextPageToken, loading, hasMore]
    );
    useEffect(() => {
        fetchMore(); // initial load
    });
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchMore();
            }
        }, {
            rootMargin: '100px'
        });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [sentinelRef.current, hasMore, fetchMore]);

    const onTaskUpdated = (task: TaskSchemaType) => {
        if(task.status !== props.status) {
            const filteredTasks = tasks.filter(t => t.id !== task.id);
            setTasks(filteredTasks);
            props.onUpdated(task);
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-3 flex flex-col gap-2">
            <h2 className="text-lg font-semibold capitalize text-center">
                {labelMap[props.status]}
            </h2>
            <div className="flex-1 flex flex-col gap-2">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onUpdated={onTaskUpdated} />
                ))}
                {loading && (
                    <>
                        <TaskCardSkeleton />
                        <TaskCardSkeleton />
                        <TaskCardSkeleton />
                    </>
                )}
                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-1" />
            </div>
        </div>
    )
}