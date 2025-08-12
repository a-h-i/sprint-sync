'use client';

import { TaskSchemaType } from '@/lib/schemas/task.schema';
import PriorityBadge from '@/lib/components/PriorityBadge';
import { capitalize } from 'lodash';
import StatusBadge from '@/lib/components/StatusBadge';
import { useState } from 'react';
import EditTaskModal from '@/lib/components/EditTaskModal';
import Badge from '@/lib/components/Badge';

interface TaskCardProps {
  task: TaskSchemaType;
  onUpdated: (task: TaskSchemaType) => void;
}

export default function TaskCard(props: TaskCardProps) {
  const [editingTask, setEditingTask] = useState(false);
  return (
    <div
      onClick={() => setEditingTask(true)}
      className='cursor-pointer rounded-md border bg-white p-3 shadow-sm transition hover:shadow-md'
    >
      <div className='text-sm font-semibold'>
        #{props.task.id} {props.task.title}
      </div>
      <div className='mt-2 flex gap-2'>
        <PriorityBadge priority={props.task.priority}>
          {capitalize(props.task.priority)}
        </PriorityBadge>
        <StatusBadge status={props.task.status}>
          {capitalize(props.task.status.replace('_', ' '))}
        </StatusBadge>

        <Badge color='gray'>
          {props.task.assigned_to != null
            ? `@${props.task.assigned_to.username}`
            : 'Unassigned'}
        </Badge>
      </div>
      {editingTask && (
        <EditTaskModal
          task={props.task}
          onClose={() => setEditingTask(false)}
          onUpdated={props.onUpdated}
        />
      )}
    </div>
  );
}
