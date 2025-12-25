import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '@domain/entities/todo.entity';

@Injectable()
export class TodoRepository {
  constructor(
    @InjectRepository(Todo) private readonly repo: Repository<Todo>,
  ) {}

  async findAll(): Promise<Todo[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Todo | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(todo: Pick<Todo, 'title' | 'description'>): Promise<Todo> {
    const entity = this.repo.create({ ...todo, completed: false });
    return this.repo.save(entity);
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) {
      return null;
    }
    const merged = this.repo.merge(existing, updates);
    return this.repo.save(merged);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
