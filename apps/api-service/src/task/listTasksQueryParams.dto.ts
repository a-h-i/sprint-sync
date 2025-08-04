import {IsEnum, IsNumber, IsOptional, IsString, Max} from "class-validator";
import {TaskStatus} from "@sprint-sync/storage";


export class ListTasksQueryParamsDto {
    @IsOptional()
    @IsString()
    nextPageToken?: string | null;

    @IsNumber()
    @Max(100)
    pageSize!: number;

    @IsOptional()
    @IsNumber()
    assigneeId?: number | null;

    @IsEnum(TaskStatus)
    status!: TaskStatus

}