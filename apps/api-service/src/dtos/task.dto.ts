import {Expose, Type} from "class-transformer";
import {TaskPriority, TaskStatus} from "@sprint-sync/storage";
import {UserDto} from "./user.dto";


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