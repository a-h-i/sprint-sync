import {Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Query} from '@nestjs/common';
import { TaskService } from './task.service';
import {User} from '@sprint-sync/storage';
import { AuthGuard } from '../auth/auth.guard';
import {CurrentUser} from "../auth/currentUser.decorator";
import {ListTasksQueryParamsDto} from "./listTasksQueryParams.dto";
import {ListTasksResponseDto} from "./listTasksResponse.dto";
import {TaskDto} from "../dtos/task.dto";
import {CreateTaskRequestDto} from "./createTaskRequest.dto";
import {UpdateTaskRequestDto} from "./updateTaskRequest.dto";

@UseGuards(AuthGuard)
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    // List tasks (users only see their tasks; admins see all)
    @Get()
    listTasks(@CurrentUser() user: User, @Query() params: ListTasksQueryParamsDto): Promise<ListTasksResponseDto> {
        return this.taskService.list(params);
    }

    @Get(':id')
    getTaskById(@Param('id', ParseIntPipe) id: number): Promise<TaskDto> {
        return this.taskService.getTaskById(id);
    }

    @Post()
    createTask(@Body() body: CreateTaskRequestDto): Promise<TaskDto> {
        return this.taskService.create(body);
    }

    @Put(':id')
    updateTask(
        @Param('id', ParseIntPipe) id: number,
        @Body() updates: UpdateTaskRequestDto,
        @CurrentUser() user: User,
    ): Promise<TaskDto> {
        return this.taskService.update(id, updates, user);
    }
}