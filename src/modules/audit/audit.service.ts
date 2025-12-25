import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AuditLog } from '@common/types/audit-log.type';
import { AuditLogRepository } from '@domain/repositories/audit-log.repository';

export interface CurrentUserContext {
  id: string;
  roles?: string[];
  email?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly repository: AuditLogRepository,
    private readonly cls: ClsService,
  ) {}

  async record(
    partial: Omit<AuditLog, 'timestamp' | 'userId'> & { userId?: string },
  ): Promise<void> {
    const user = this.cls.get<CurrentUserContext | undefined>('user');
    const log: AuditLog = {
      ...partial,
      userId: partial.userId ?? user?.id,
      timestamp: new Date(),
    };
    console.log('📝 Recording audit log:', {
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userId: log.userId,
    });
    await this.repository.insert(log);
    console.log('✅ Audit log recorded to MongoDB');
  }

  async recordCreate(
    entity: string,
    entityId?: string,
    after?: unknown,
  ): Promise<void> {
    await this.record({ action: 'create', entity, entityId, after });
  }

  async recordUpdate(
    entity: string,
    entityId?: string,
    before?: unknown,
    after?: unknown,
  ): Promise<void> {
    await this.record({ action: 'update', entity, entityId, before, after });
  }

  async recordRemove(
    entity: string,
    entityId?: string,
    before?: unknown,
  ): Promise<void> {
    await this.record({ action: 'remove', entity, entityId, before });
  }

  async getAll(limit = 100): Promise<AuditLog[]> {
    return this.repository.findAll(limit);
  }

  async getByEntity(entity: string, limit = 100): Promise<AuditLog[]> {
    return this.repository.findByEntity(entity, limit);
  }
}
