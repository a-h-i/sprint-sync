'use client';

import {
  CreateTaskSchema,
  CreateTaskSchemaType,
} from '@/lib/schemas/createTask.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskPriority, TaskStatus } from '@sprint-sync/enums';
import { useEffect, useMemo, useRef, useTransition } from 'react';
import toast from 'react-hot-toast';
import { createTask } from '@/lib/api/createTask.action';
import { TaskSchemaType } from '@/lib/schemas/task.schema';
import ModalDialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ModalDialog';
import Label from '@/lib/components/Label';
import Input from '@/lib/components/Input';
import TextArea from '@/lib/components/TextArea';
import Button from '@/lib/components/Button';
import { useImmerReducer } from 'use-immer';
import {
  generateDescriptionReducer,
  GenerateDescriptionStatus,
  getGenerateDescriptionInitialState,
} from '@/lib/reducers/generateDescription.reducer';
import {
  decodeDescriptionChunk,
  TokenSSEEventPayloadSchema,
} from '@/lib/streaming-events/decode-description-chunk';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: (task: TaskSchemaType) => void;
}

export default function CreateTaskModal({
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = useForm<CreateTaskSchemaType>({
    resolver: zodResolver(CreateTaskSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
    },
  });

  const [generateDescriptionState, generateDescriptionDispatch] =
    useImmerReducer(
      generateDescriptionReducer,
      getGenerateDescriptionInitialState(),
    );
  const [isPending, startTransition] = useTransition();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const { ref: descriptionRef, ...descriptionRest } = register('description');

  const onSubmit = (data: CreateTaskSchemaType) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
        const task = await createTask(formData);
        toast.success('Task created!');
        onCreated(task);
        onClose();
        reset();
      } catch (e: unknown) {
        toast.error('Failed to create task');
        console.error(e);
      }
    });
  };
  const generateDescription = () => {
    generateDescriptionDispatch({
      type: 'stream_start',
    });
    const title = getValues('title');
    if (title == null || title.length < 5) {
      generateDescriptionDispatch({
        type: 'idle',
      });
      return;
    }
    setValue('description', '');
    const url = new URL('/api/suggest_task', window.location.origin);
    url.searchParams.set('task_title', title);
    const eventSource = new EventSource(url);
    esRef.current?.close();
    esRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const decodedChunks = decodeDescriptionChunk(event.data);
      for (const chunk of decodedChunks) {
        if (chunk.type == 'ai_token') {
          const payload = TokenSSEEventPayloadSchema.parse(chunk.payload);
          generateDescriptionDispatch({
            type: 'stream_chunk',
            chunk: payload.token,
          });
        } else if (chunk.type == 'ai_end') {
          generateDescriptionDispatch({
            type: 'stream_end',
          });
        } else if (chunk.type == 'ai_start') {
          generateDescriptionDispatch({
            type: 'stream_start',
          });
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      generateDescriptionDispatch({
        type: 'stream_end',
      });
    };
  };
  useEffect(() => {
    return () => {
      esRef.current?.close(); // cleanup on unmount
    };
  }, []);

  const formDescriptionValue = watch('description');
  useEffect(() => {
    switch (generateDescriptionState.status) {
      case GenerateDescriptionStatus.IDLE:
        break;
      case GenerateDescriptionStatus.WAITING_FOR_STREAM:
        setValue('description', 'Thinking...');
        break;
      case GenerateDescriptionStatus.STREAMING:
        setValue(
          'description',
          generateDescriptionState.streamingChunks.join(''),
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
        requestAnimationFrame(() => {
          if (textAreaRef.current != null) {
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
          }
        });
        break;
      case GenerateDescriptionStatus.STREAMING_DONE:
        setValue(
          'description',
          generateDescriptionState.streamingChunks.join(''),
        );
        generateDescriptionDispatch({
          type: 'idle',
        });
        break;
    }
  }, [
    generateDescriptionState,
    formDescriptionValue,
    setValue,
    generateDescriptionDispatch,
  ]);
  const titleValue = watch('title');
  const generateButtonIsDisabled = useMemo(() => {
    if (generateDescriptionState.status === GenerateDescriptionStatus.IDLE) {
      return titleValue.length < 5;
    }
    return true;
  }, [generateDescriptionState, titleValue]);

  return (
    <ModalDialog open onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
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
            <TextArea
              readOnly={
                generateDescriptionState.status ===
                GenerateDescriptionStatus.IDLE
              }
              rows={10}
              {...descriptionRest}
              ref={(e) => {
                descriptionRef(e);
                textAreaRef.current = e;
              }}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Button
              disabled={generateButtonIsDisabled}
              onClick={generateDescription}
              variant='primary'
            >
              Generate Description
            </Button>
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

          <Button
            type='submit'
            disabled={
              isPending || !isDirty || !isValid || generateButtonIsDisabled
            }
            variant='primary'
          >
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </ModalDialog>
  );
}
