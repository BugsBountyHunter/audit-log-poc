import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TodoService } from '@modules/todo/todo.service';
import { Todo } from '@domain/entities/todo.entity';

@Controller('todos')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Get()
  getAll(): Promise<Todo[]> {
    return this.service.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Todo> {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() body: { title: string; description?: string }): Promise<Todo> {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<Todo>): Promise<Todo> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
