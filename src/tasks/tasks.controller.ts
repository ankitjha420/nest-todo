import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TaskStatus } from './task-status.enum'
import { CreateTaskDto } from './dto/create-task.dto'
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto'
import { Task } from './task.entity'
import { AuthGuard } from '@nestjs/passport'

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
    constructor(private taskService: TasksService) {
    }

    @Get()
    getTasks(@Query() filterDTO: GetTasksFilterDto): Promise<Task[]> {
        return this.taskService.getTasks(filterDTO)
    }

    @Post()
    async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
        return this.taskService.createTask(createTaskDto)
    }

    @Get('/:id')
    getTaskById(@Param('id') id: string): Promise<Task> {
        return this.taskService.getTaskById(id)
    }

    @Delete('/:id')
    deleteTaskById(@Param('id') id: string): void {
        console.log(this.taskService.deleteTaskById(id))
    }

    @Patch('/:id')
    updateTaskStatusById(
        @Param('id') id: string,
        @Param('status') status: TaskStatus,
    ): Promise<Task> {
        return this.taskService.updateTaskStatusById(id, status)
    }
}
