import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

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
export class CreateTaskRequestDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
