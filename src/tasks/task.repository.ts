import { Repository } from 'typeorm'
import { Task } from './task.entity'
import { Injectable } from '@nestjs/common'
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto'

@Injectable()
export class TaskRepository extends Repository<Task> {

}