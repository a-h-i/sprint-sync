import { Injectable, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Task, TaskStatus, User } from '@sprint-sync/storage'; // Using Task and Status enums
import { ListTasksQueryParamsDto } from './listTasksQueryParams.dto';
import { createTask, listTasks, updateTask } from '@sprint-sync/control';
import { ListTasksResponseDto } from './listTasksResponse.dto';
import { plainToInstance } from 'class-transformer';
import { TaskDto } from '../dtos/task.dto';
import { CreateTaskRequestDto } from './createTaskRequest.dto';
import { UpdateTaskRequestDto } from './updateTaskRequest.dto';

@Injectable()
export class TaskService {
  constructor(private source: DataSource) {}

  async list(params: ListTasksQueryParamsDto): Promise<ListTasksResponseDto> {
    const page = await listTasks(this.source.manager, {
      pageSize: params.pageSize,
      nextPageToken: params.nextPageToken ?? undefined,
      assignedToUserId: params.assigneeId ?? undefined,
      status: params.status ?? undefined,
    });

    const tasks = await Promise.all(
      page.tasks.map(async (task) => {
        if (task.assigned_to_user_id == null) {
          return {
            ...task,
            assigned_to: null,
          };
        } else {
          let user = await task.assigned_to;
          return {
            ...task,
            assigned_to:
              user == null
                ? null
                : {
                    ...user,
                    profile: await user.profile,
                  },
          };
        }
      }),
    );
    return plainToInstance(
      ListTasksResponseDto,
      {
        tasks,
        nextPageToken: page.nextPageToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getTaskById(id: number): Promise<TaskDto> {
    const task = await this.source.manager.findOneByOrFail(Task, { id });
    let user = await task.assigned_to;
    if (user != null) {
      return plainToInstance(
        TaskDto,
        {
          ...task,
          assigned_to: {
            ...user,
            profile: await user.profile,
          },
        },
        {
          excludeExtraneousValues: true,
        },
      );
    }
    return plainToInstance(
      TaskDto,
      {
        ...task,
        assigned_to: null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async create(data: CreateTaskRequestDto): Promise<TaskDto> {
    const task = await createTask(this.source.manager, {
      title: data.title,
      description: data.description ?? undefined,
      priority: data.priority,
      status: data.status,
      total_minutes: 0,
      assigned_to_user_id: null,
    });
    return plainToInstance(
      TaskDto,
      {
        ...task,
        assigned_to: null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async update(
    id: number,
    data: UpdateTaskRequestDto,
    user: User,
  ): Promise<TaskDto> {
    const taskToUpdate = await this.source.manager.findOneByOrFail(Task, {
      id,
    });
    if (!user.is_admin) {
      if (
        data.assigned_to_user_id != null &&
        data.assigned_to_user_id !== user.id
      ) {
        throw new ForbiddenException();
      } else if (data.assigned_to_user_id == null) {
        if (taskToUpdate.assigned_to_user_id !== user.id) {
          throw new ForbiddenException();
        }
      }
    }
    const task = await updateTask(this.source.manager, id, {
      title: data.title,
      description: data.description ?? '',
      priority: data.priority,
      status: data.status,
      assigned_to_user_id: data.assigned_to_user_id,
    });
    let taskUser = await task.assigned_to;
    if (taskUser != null) {
      return plainToInstance(
        TaskDto,
        {
          ...task,
          assigned_to: {
            ...taskUser,
            profile: await taskUser.profile,
          },
        },
        {
          excludeExtraneousValues: true,
        },
      );
    }
    return plainToInstance(
      TaskDto,
      {
        ...task,
        assigned_to: null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
