import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';

// recreates enums to bypass bug in nestcli/swagger require path generation in monorepo
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
export class TaskDto {
  @Expose()
  id!: number;

  @Expose()
  title!: string;

  @Expose()
  description?: string | null;

  @Expose()
  priority!: TaskPriority;

  @Expose()
  status!: TaskStatus;

  @Expose()
  total_minutes!: number;

  @Expose()
  @Type(() => UserDto)
  assigned_to?: UserDto | null;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;
}
