import {IsEnum, IsNumber, IsOptional, IsString, MinLength} from "class-validator";
import {TaskPriority, TaskStatus} from "@sprint-sync/storage";


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