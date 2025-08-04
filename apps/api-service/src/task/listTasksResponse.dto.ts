import {Expose, Type} from "class-transformer";
import {TaskDto} from "../dtos/task.dto";


export class ListTasksResponseDto {
    @Expose()
    @Type(() => TaskDto)
    tasks!: TaskDto[];

    @Expose()
    nextPageToken!: string | null;
}