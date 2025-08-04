import {IsEnum, IsOptional, IsString, MinLength} from "class-validator";
import {TaskPriority, TaskStatus} from "@sprint-sync/storage";

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