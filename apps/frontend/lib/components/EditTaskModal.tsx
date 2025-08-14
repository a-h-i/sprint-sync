'use client';

import { TaskSchemaType } from '@/lib/schemas/task.schema';
import {
  EditTaskSchema,
  EditTaskSchemaType,
} from '@/lib/schemas/editTask.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { updateTask } from '@/lib/api/updateTask.action';
import toast from 'react-hot-toast';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from '@headlessui/react';
import ModalDialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ModalDialog';
import Label from '@/lib/components/Label';
import Input from '@/lib/components/Input';
import TextArea from '@/lib/components/TextArea';
import { CurrentUserContext } from '@/lib/context/currentUser.context';
import { clsx } from 'clsx';
import { UserSchemaType } from '@/lib/schemas/user.schema';
import { debounce } from 'lodash';
import { listUsers } from '@/lib/api/list-users.action';
import Button from '@/lib/components/Button';

interface EditTaskModalProps {
  task: TaskSchemaType;
  onClose: () => void;
  onUpdated: (task: TaskSchemaType) => void;
}

export default function EditTaskModal({
  task,
  onClose,
  onUpdated,
}: EditTaskModalProps) {
  const currentUser = useContext(CurrentUserContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch,
  } = useForm<EditTaskSchemaType>({
    resolver: zodResolver(EditTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      total_minutes: task.total_minutes,
      assigned_to_user_id: task.assigned_to?.id,
    },
  });
  const [isPending, startTransition] = useTransition();
  const assignedUserId = watch('assigned_to_user_id');
  const isAssigned = assignedUserId != null;
  const isAssignedToMe = assignedUserId === currentUser?.id;
  // --- Assignment state ---
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<UserSchemaType[]>([]);
  const [searching, setSearching] = useState(false);
  const selectedUser = useMemo(() => {
    if (assignedUserId == null) {
      return null;
    }
    if (assignedUserId === currentUser?.id) {
      return currentUser;
    }

    return options.find((user) => user.id === assignedUserId);
  }, [assignedUserId, options, currentUser]);

  const searchUsers = useCallback(
    debounce(async (query: string) => {
      if (!currentUser?.is_admin) return; // non-admins can't search
      setSearching(true);
      const search = query.trim();
      const data = await listUsers({
        pageSize: 50,
        username: search.length > 0 ? search : undefined,
      });
      setOptions(data.users);
      setSearching(false);
    }),
    [currentUser],
  );

  useEffect(() => {
    searchUsers(query);
  }, [query, searchUsers]);

  const onSubmit = (data: EditTaskSchemaType) => {
    startTransition(async () => {
      try {
        const updatedTask = await updateTask(task.id, data);
        onUpdated(updatedTask);
        onClose();
      } catch (_) {
        toast.error('Failed to update task');
      }
    });
  };

  const assignToMe = () => {
    setValue('assigned_to_user_id', currentUser?.id, { shouldDirty: true });
  };

  const unassign = () => {
    setValue('assigned_to_user_id', null, { shouldDirty: true });
  };
  return (
    <ModalDialog open onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task #{task.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label>Title</Label>
            <Input {...register('title')} />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <TextArea rows={10} {...register('description')} />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Label>Priority</Label>
              <select
                {...register('priority')}
                className='w-full rounded border p-2'
              >
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </select>
            </div>

            <div className='flex-1'>
              <Label>Status</Label>
              <select
                {...register('status')}
                className='w-full rounded border p-2'
              >
                <option value='todo'>To Do</option>
                <option value='in_progress'>In Progress</option>
                <option value='done'>Done</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Total Minutes</Label>
            <Input type='number' {...register('total_minutes')} />
          </div>

          <div className='space-y-2'>
            <Label>Assignment</Label>
            <div className='flex gap-2'>
              <Button
                type='button'
                onClick={assignToMe}
                variant='primary'
                className={clsx({
                  hidden: isAssignedToMe,
                })}
                title='Assign this task to yourself'
              >
                Assign to me
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={unassign}
                className={clsx(
                  'rounded bg-gray-200 px-3 py-1.5 hover:bg-gray-300',
                  {
                    hidden: !isAssigned,
                  },
                )}
                title='Remove current assignee'
              >
                Unassign
              </Button>
            </div>

            <div className='relative'>
              <Label>Assign to user</Label>
              <div
                className={clsx({
                  'cursor-not-allowed': !currentUser?.is_admin,
                })}
                title={
                  !currentUser?.is_admin
                    ? 'Only admins can assign tasks to other users'
                    : 'Select user'
                }
              >
                <Combobox
                  value={selectedUser ?? null}
                  onChange={(user: UserSchemaType | null) => {
                    setValue('assigned_to_user_id', user?.id ?? null, {
                      shouldDirty: true,
                    });
                  }}
                  disabled={!currentUser?.is_admin}
                >
                  <div className='relative'>
                    <ComboboxInput
                      className={`w-full rounded border p-2 ${!currentUser?.is_admin ? 'bg-gray-100 text-gray-500' : ''}`}
                      displayValue={(user: UserSchemaType | null) =>
                        user?.username != null ? `@${user.username}` : ''
                      }
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={
                        !currentUser?.is_admin
                          ? 'Admin only'
                          : 'Search by username...'
                      }
                    />
                    <Transition
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                      afterLeave={() => setQuery('')}
                    >
                      <ComboboxOptions className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow'>
                        {searching && (
                          <div className='p-2 text-sm text-gray-500'>
                            Searching…
                          </div>
                        )}
                        {!searching && options.length === 0 && query && (
                          <div className='p-2 text-sm text-gray-500'>
                            No users found
                          </div>
                        )}
                        {options.map((user) => (
                          <ComboboxOption
                            key={user.id}
                            value={user}
                            className={({ focus }) =>
                              `cursor-pointer p-2 text-sm select-none ${focus ? 'bg-blue-50' : ''}`
                            }
                          >
                            @{user.username}
                          </ComboboxOption>
                        ))}
                      </ComboboxOptions>
                    </Transition>
                  </div>
                </Combobox>
              </div>
            </div>
          </div>

          <Button
            variant='primary'
            type='submit'
            disabled={isPending || !isDirty || !isValid}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </ModalDialog>
  );
}
