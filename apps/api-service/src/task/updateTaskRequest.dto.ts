import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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
export class UpdateTaskRequestDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsNumber()
  @IsOptional()
  assigned_to_user_id?: number | null;
}
