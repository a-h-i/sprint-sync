'use client';
import { TaskStatus } from '@sprint-sync/enums';
import { TaskSchemaType } from '@/lib/schemas/task.schema';
import TaskCard from '@/lib/components/TaskCard';
import TaskCardSkeleton from '@/lib/components/TaskCardSkeleton';

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
};

export default function TaskColumn(props: TaskColumnProps) {
  return (
    <div className='flex flex-col gap-2 rounded-lg bg-white p-3 shadow-md'>
      <h2 className='text-center text-lg font-semibold capitalize'>
        {labelMap[props.status]}
      </h2>
      <div className='flex flex-1 flex-col gap-2'>
        {props.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onUpdated={props.onUpdated} />
        ))}
        {props.loading && (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        )}
      </div>
    </div>
  );
}
