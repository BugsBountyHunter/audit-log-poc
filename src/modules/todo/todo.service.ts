import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from '@domain/repositories/todo.repository';
import { Todo } from '@domain/entities/todo.entity';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TodoService {
  constructor(
    private readonly repository: TodoRepository,
    private readonly cls: ClsService,
  ) {}

  getAll(): Promise<Todo[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Todo> {
    return this.repository.findById(id).then((todo) => {
      if (!todo) {
        throw new NotFoundException('Todo not found');
      }
      return todo;
    });
  }

  create(payload: { title: string; description?: string }): Promise<Todo> {
    return this.cls.run(async () => {
      return this.repository.create(payload);
    });
  }

  async update(id: string, payload: Partial<Todo>): Promise<Todo> {
    return this.cls.run(async () => {
      const updated = await this.repository.update(id, payload);
      if (!updated) {
        throw new NotFoundException('Todo not found');
      }
      return updated;
    });
  }

  async remove(id: string): Promise<void> {
    return this.cls.run(async () => {
      const removed = await this.repository.remove(id);
      if (!removed) {
        throw new NotFoundException('Todo not found');
      }
    });
  }
}
