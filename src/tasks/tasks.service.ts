import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskStatus } from './task-status.enum'
import { CreateTaskDto } from './dto/create-task.dto'
import { TaskRepository } from './task.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from './task.entity'
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto'

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: TaskRepository
    ) {}

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        const query = this.taskRepository.createQueryBuilder('task')
        const { status, search } = filterDto

        if (status) {
            query.andWhere('task.status = :status', { status })
        }

        if (search) {
            query.andWhere(
                'task.title LIKE :search OR task.description LIKE :search',
                { search: `%${search}%` }
            )
        }

        return await query.getMany()
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto

        const task = this.taskRepository.create({
            title,
            description,
            status: TaskStatus.OPEN
        })

        await this.taskRepository.save(task)
        return task
    }

    async getTaskById(id: string): Promise<Task> {
        const found = await this.taskRepository.findOne({where: { id }})
        if (!found) {
            throw new NotFoundException('Task not found: ', id)
        }

        return found
    }

    async deleteTaskById(id: string): Promise<string> {
        const res = await this.taskRepository.delete(id)
        if (res.affected === 0) {
            throw new NotFoundException('Task not found: ', id)
        }
        else {
            return 'Task deleted: ' + id
        }
    }

    async updateTaskStatusById(id: string, status: TaskStatus): Promise<Task> {
        const task = await this.getTaskById(id)
        if (task) {
            task.status = status
            await this.taskRepository.save(task)
        }
        return task
    }
}
