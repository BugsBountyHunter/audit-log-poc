import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@database/database.module';

// Entities
import { Todo } from '@domain/entities/todo.entity';

// Repositories
import { TodoRepository } from '@domain/repositories/todo.repository';
import { AuditLogRepository } from '@domain/repositories/audit-log.repository';

@Global()
@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Todo])],
  providers: [TodoRepository, AuditLogRepository],
  exports: [TypeOrmModule, TodoRepository, AuditLogRepository],
})
export class DomainModule {}
